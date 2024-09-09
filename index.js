const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

let users = {};
let admins = {};
let usersData = {};

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const client = data.toString(); // Convert the buffer to a string
    try {
      const clientData = JSON.parse(client);
      ws.id = clientData.id;
      if (clientData.type === "admin") {
        console.log(`A admin connected with ID: ${clientData.id}`);
        admins[clientData.id] = ws;
      } else {
        console.log(`A user connected with ID: ${clientData.id}`);
        users[clientData.id] = ws;
        usersData[clientData.id] = clientData;
      }

      console.log(usersData);

      Object.values(admins).forEach((admin) =>
        admin.send(JSON.stringify(Object.values(usersData)))
      );
    } catch (err) {
      console.log("Received non-JSON message:", message);
    }
  });

  ws.on("close", () => {
    if (ws.id) {
      // Remove the client from users, admins, and usersData based on its ID
      delete users[ws.id];
      delete admins[ws.id];
      delete usersData[ws.id];

      console.log(`Client with ID ${ws.id} disconnected`);

      // Notify all admins about the updated usersData after the user disconnects
      Object.values(admins).forEach((admin) =>
        admin.send(JSON.stringify(Object.values(usersData)))
      );
    }
  });
});

server.listen(5500, () => {
  console.log("Server is running on port 5500");
});
