const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("input");

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = input.value;
    socket.emit("user_message", text);
    addMsg("user", text);
    input.value = "";
  }
});

socket.on("bot_message", (msg) => addMsg("bot", msg));

function addMsg(sender, text) {
  const p = document.createElement("p");
  p.innerHTML = `<b>${sender}:</b> ${text}`;
  chat.appendChild(p);
}
