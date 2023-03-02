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

interface Room {
  room: string;
  clients: string[];
}
const openRooms = new Map<string, Room>();
const joiningRooms = new Map<string, Room[]>();

io.on("connection", (socket) => {
  socket.on("new_come", (id: string) => {
    socket.emit("new_come", JSON.stringify(Object.fromEntries(openRooms)));
  });
  socket.on("enter_room", (roomName: string, nickName: string, id: string) => {
    const room = openRooms.get(roomName);
    const user = joiningRooms.get(id);

    socket.join(roomName);
    console.log(socket);

    if (room) room.clients.push(id);
    else openRooms.set(roomName, { room: roomName, clients: [id] });

    if (user) user.push({ room: roomName, clients: [id] });
    else joiningRooms.set(id, [{ room: roomName, clients: [id] }]);
    console.log(openRooms);
    console.log(joiningRooms);
  });
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
