import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const server = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "http://localhost:3000",
  },
}).of("/chatRooms");

const openRooms = new Map();
const joiningRooms = new Map();
openRooms.set("1", { room: "room1", clients: ["client1"] });

io.on("connection", (socket) => {
  socket.on("new_come", (id: string) => {
    console.log(openRooms);

    socket.emit("new_come", JSON.stringify(Array.from(openRooms.entries())));
  });
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
