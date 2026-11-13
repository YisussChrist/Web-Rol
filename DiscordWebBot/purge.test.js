const test = require("node:test");
const assert = require("node:assert/strict");
const { Collection } = require("discord.js");
const { comandoPurge } = require("./purge");

function escenario({ textos = [], usuario = true, bot = true, servidor = true, falla = -1 } = {}) {
    const borrados = [];
    const respuestas = [];
    const consultas = [];
    const historial = new Collection(textos.map((content, i) => [String(i), {
        id: String(i), content,
        // Incluye mensajes antiguos: no deben quedar excluidos del borrado.
        createdTimestamp: 0,
        async delete() {
            if (i === falla) throw new Error("Borrado rechazado");
            borrados.push(i);
        }
    }]));
    const message = {
        id: "comando",
        inGuild: () => servidor,
        client: { user: { id: "bot" } },
        member: { permissionsIn: () => ({ has: () => usuario }) },
        channel: {
            permissionsFor: () => ({ has: () => bot }),
            messages: { async fetch(opciones) {
                consultas.push(opciones);
                return new Collection([...historial].slice(0, opciones.limit));
            } }
        },
        async reply(respuesta) { respuestas.push(respuesta); }
    };
    return { message, borrados, respuestas, consultas };
}

test("borra solo coincidencias dentro de los 50 anteriores al comando", async () => {
    const textos = Array(51).fill("mensaje de rol");
    textos[0] = "comentario ///";
    textos[49] = "/// otro comentario";
    textos[50] = "/// fuera del límite";
    const s = escenario({ textos });
    await comandoPurge(s.message, "all ///");
    assert.deepEqual(s.consultas, [{ limit: 50, before: "comando" }]);
    assert.deepEqual(s.borrados, [0, 49]);
    assert.match(s.respuestas[0].content, /borrado 2 mensajes de los 50/);
    assert.deepEqual(s.respuestas[0].allowedMentions, { parse: [], repliedUser: false });
});

test("el filtro es literal, admite espacios y distingue mayúsculas", async () => {
    const s = escenario({ textos: ["hola .* mundo", "hola cualquier mundo", "HOLA .* mundo"] });
    await comandoPurge(s.message, "ALL hola .* mundo");
    assert.deepEqual(s.borrados, [0]);
});

test("rechaza filtros vacíos y sintaxis inválida sin leer ni borrar", async () => {
    for (const entrada of [undefined, "", "all", "all   ", "///", "alll ///"]) {
        const s = escenario({ textos: ["///"] });
        await comandoPurge(s.message, entrada);
        assert.equal(s.consultas.length, 0);
        assert.equal(s.borrados.length, 0);
        assert.match(s.respuestas[0].content, /Uso:/);
    }
});

test("rechaza mensajes privados y falta de permisos de usuario o bot", async () => {
    for (const opciones of [{ servidor: false }, { usuario: false }, { bot: false }]) {
        const s = escenario({ textos: ["///"], ...opciones });
        await comandoPurge(s.message, "all ///");
        assert.equal(s.consultas.length, 0);
        assert.equal(s.borrados.length, 0);
        assert.equal(s.respuestas.length, 1);
    }
});

test("informa cuando no hay coincidencias", async () => {
    const s = escenario({ textos: ["rol"] });
    await comandoPurge(s.message, "all ///");
    assert.equal(s.borrados.length, 0);
    assert.match(s.respuestas[0].content, /No hay coincidencias/);
});

test("un borrado fallido no impide el resto y se informa del resultado parcial", async t => {
    t.mock.method(console, "error", () => {});
    const s = escenario({ textos: ["///", "///", "///"], falla: 1 });
    await comandoPurge(s.message, "all ///");
    assert.deepEqual(s.borrados, [0, 2]);
    assert.match(s.respuestas[0].content, /borrado 2 mensajes.*No he podido borrar 1/);
});

test("un fallo al leer el historial no borra mensajes", async t => {
    t.mock.method(console, "error", () => {});
    const s = escenario({ textos: ["///"] });
    s.message.channel.messages.fetch = async () => { throw new Error("Sin acceso"); };
    await comandoPurge(s.message, "all ///");
    assert.deepEqual(s.borrados, []);
    assert.match(s.respuestas[0].content, /No he podido leer/);
});
