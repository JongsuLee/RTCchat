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
let curId: string;
let idx: number = 0;

io.on("connection", (socket) => {
  socket.on("new_come", (id: string) => {
    socket.emit("new_come", JSON.stringify(Object.fromEntries(openRooms)));
  });

  socket.on("renewal", (id: string) => {
    socket.emit(
      "renewal",
      JSON.stringify(Object.fromEntries(openRooms)),
      JSON.stringify(joiningRooms.get(id))
    );
  });

  socket.on("enter_room", (roomName: string, nickName: string, id: string) => {
    curId = id;
    const room = openRooms.get(roomName);
    const join = joiningRooms.get(curId);

    socket.join(roomName);

    if (room) room.clients.push(curId);
    else openRooms.set(roomName, { room: roomName, clients: [curId] });

    if (join) {
      join.push({
        room: roomName,
        clients: openRooms.get(roomName)?.clients || [curId],
      });
    } else {
      joiningRooms.set(id, [
        {
          room: roomName,
          clients: openRooms.get(roomName)?.clients || [curId],
        },
      ]);
    }
  });

  socket.on("go_back", (roomName: string) => {
    console.log("goback11");
    console.log(socket.id);
    console.log();

    socket.leave(roomName);
  });
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
