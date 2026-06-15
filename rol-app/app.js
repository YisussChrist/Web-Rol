const characters = [
  {
    name: "Renzu Itō",
    avatar: "https://static.wikia.nocookie.net/inazuma-eleven-eternal-thunder/images/8/84/RenzuIto2.png/revision/latest/scale-to-width-down/535?cb=20250905101830&path-prefix=es",
    color: "#f97316"
  },
  {
    name: "Freyja Kane",
    avatar: "https://i.imgur.com/8Km9tLL.png",
    color: "#dc2626"
  },
  {
    name: "Nara Midori",
    avatar: "https://i.imgur.com/8Km9tLL.png",
    color: "#22c55e"
  }
];

const chat = document.getElementById("chat");
const characterSelect = document.getElementById("characterSelect");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

characters.forEach((character, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = character.name;
  characterSelect.appendChild(option);
});

function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  const character = characters[characterSelect.value];

  const message = document.createElement("div");
  message.classList.add("message");

  message.innerHTML = `
    <img class="avatar" src="${character.avatar}" alt="${character.name}">
    <div class="message-content">
      <div class="character-name" style="color: ${character.color}">
        ${character.name}
      </div>
      <p class="message-text">${text}</p>
    </div>
  `;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;

  messageInput.value = "";
  messageInput.focus();
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});