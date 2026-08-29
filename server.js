const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dreagon Live Chat</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f2f2f2;
    }

    .chat {
      max-width: 700px;
      height: 90vh;
      margin: 5vh auto;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: #222;
      color: white;
      padding: 18px;
      font-size: 20px;
      font-weight: bold;
    }

    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }

    .message {
      background: #eee;
      padding: 10px;
      margin-bottom: 8px;
      border-radius: 8px;
    }

    .system {
      background: #fff3cd;
    }

    .input-area {
      display: flex;
      gap: 8px;
      padding: 10px;
      border-top: 1px solid #ddd;
    }

    input {
      flex: 1;
      padding: 12px;
      font-size: 16px;
    }

    button {
      padding: 12px 20px;
      background: #222;
      color: white;
      border: 0;
      cursor: pointer;
    }
  </style>
</head>

<body>

<div class="chat">
  <div class="header">🌐 Dreagon Live Chat</div>

  <div id="messages"></div>

  <div class="input-area">
    <input id="messageInput" placeholder="Type a message..." autocomplete="off">
    <button onclick="sendMessage()">Send</button>
  </div>
</div>

<script>
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

const protocol = location.protocol === "https:" ? "wss://" : "ws://";
const socket = new WebSocket(protocol + location.host);

function addMessage(text, system = false) {
  const div = document.createElement("div");
  div.className = system ? "message system" : "message";
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

socket.onopen = () => {
  addMessage("Connected to the chat.", true);
};

socket.onmessage = (event) => {
  addMessage(event.data);
};

socket.onclose = () => {
  addMessage("Disconnected from server.", true);
};

socket.onerror = () => {
  addMessage("WebSocket error.", true);
};

function sendMessage() {
  const message = input.value.trim();

  if (!message) return;

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    input.value = "";
    input.focus();
  }
}

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
</script>

</body>
</html>`);
});

wss.on("connection", (socket) => {
  console.log("Player connected");

  broadcast("A user joined the chat.");

  socket.on("message", (message) => {
    const text = message.toString().trim();

    if (!text) return;

    console.log("Message:", text);
    broadcast(text);
  });

  socket.on("close", () => {
    console.log("Player disconnected");
    broadcast("A user left the chat.");
  });
});

function broadcast(message) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
