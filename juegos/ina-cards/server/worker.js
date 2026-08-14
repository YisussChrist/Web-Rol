import { DurableObject } from "cloudflare:workers";
import { addPlayer, applyAction, createRoom, publicView } from "../engine.js";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") return json({ ok: true });

      if (url.pathname === "/api/rooms" && request.method === "POST") {
        const body = await readBody(request);
        const name = cleanName(body.name);
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const code = roomCode();
          const token = secureToken();
          const room = getRoom(env, code);
          const response = await room.fetch("https://room.internal/create", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({ name, token, code }),
          });
          if (response.status === 201) return json({ code, token }, 201);
        }
        return json({ error: "No se ha podido crear una sala. Inténtalo de nuevo." }, 503);
      }

      const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/join$/);
      if (joinMatch && request.method === "POST") {
        const code = joinMatch[1];
        const body = await readBody(request);
        const token = secureToken();
        const room = getRoom(env, code);
        const response = await room.fetch("https://room.internal/join", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ name: cleanName(body.name), token }),
        });
        if (!response.ok) return withCors(response);
        return json({ code, token });
      }

      const connectMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/connect$/);
      if (connectMatch && request.method === "GET") {
        if (request.headers.get("Upgrade") !== "websocket") {
          return json({ error: "Esta ruta necesita una conexión WebSocket." }, 426);
        }
        const token = url.searchParams.get("token") || "";
        const room = getRoom(env, connectMatch[1]);
        return room.fetch(
          new Request(`https://room.internal/connect?token=${encodeURIComponent(token)}`, request),
        );
      }

      return json({ error: "Ruta no encontrada." }, 404);
    } catch (error) {
      return json({ error: friendlyError(error) }, 400);
    }
  },
};

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const state = await this.loadState();

    if (url.pathname === "/create" && request.method === "POST") {
      if (state) return json({ error: "La sala ya existe." }, 409);
      const body = await readBody(request);
      const newState = createRoom(body.code, { name: cleanName(body.name), token: body.token });
      await this.persist(newState);
      return json({ ok: true }, 201);
    }

    if (url.pathname === "/join" && request.method === "POST") {
      if (!state) return json({ error: "La sala no existe o ha caducado." }, 404);
      const body = await readBody(request);
      try {
        addPlayer(state, { name: cleanName(body.name), token: body.token });
        await this.persist(state);
        this.broadcast(state);
        return json({ ok: true });
      } catch (error) {
        return json({ error: friendlyError(error) }, 409);
      }
    }

    if (url.pathname === "/connect" && request.method === "GET") {
      if (!state) return json({ error: "La sala no existe o ha caducado." }, 404);
      const token = url.searchParams.get("token") || "";
      if (!state.players.some((player) => player.token === token)) {
        return json({ error: "El acceso a esta sala no es válido." }, 403);
      }

      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.ctx.acceptWebSocket(server, [token]);
      server.send(JSON.stringify({ type: "state", state: publicView(state, token) }));
      return new Response(null, { status: 101, webSocket: client });
    }

    return json({ error: "Acción de sala no encontrada." }, 404);
  }

  async webSocketMessage(socket, message) {
    const token = this.ctx.getTags(socket)[0];
    try {
      const state = await this.loadState();
      if (!state) throw new Error("La sala ya ha caducado.");
      const action = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message));
      applyAction(state, token, action);
      await this.persist(state);
      this.broadcast(state);
    } catch (error) {
      socket.send(JSON.stringify({ type: "error", message: friendlyError(error) }));
    }
  }

  async webSocketError(socket) {
    try {
      socket.close(1011, "Error de conexión");
    } catch {
      // El socket ya estaba cerrado.
    }
  }

  async alarm() {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.close(1001, "La sala ha caducado por inactividad");
      } catch {
        // El socket ya estaba cerrado.
      }
    }
    await this.ctx.storage.deleteAll();
  }

  broadcast(state) {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        const token = this.ctx.getTags(socket)[0];
        socket.send(JSON.stringify({ type: "state", state: publicView(state, token) }));
      } catch {
        try {
          socket.close(1011, "No se ha podido sincronizar la partida");
        } catch {
          // El socket ya estaba cerrado.
        }
      }
    }
  }

  async loadState() {
    return (await this.ctx.storage.get("state")) || null;
  }

  async persist(state) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await Promise.all([
      this.ctx.storage.put("state", state),
      this.ctx.storage.setAlarm(expiresAt),
    ]);
  }
}

async function readBody(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") throw new Error("Los datos enviados no son válidos.");
  return body;
}

function cleanName(value) {
  const name = String(value || "").trim().slice(0, 24);
  if (!name) throw new Error("Escribe un nombre para jugar.");
  return name;
}

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function secureToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getRoom(env, code) {
  const id = env.GAME_ROOMS.idFromName(code);
  return env.GAME_ROOMS.get(id);
}

function friendlyError(error) {
  return error instanceof Error ? error.message : "Ha ocurrido un error inesperado.";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS },
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}
