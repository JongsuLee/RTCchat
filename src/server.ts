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
  clients: Set<string>;
}
interface OpenRoomsObj {
  [key: string]: object;
}
interface JoiningRoomsObj {
  room: string;
  clients: string[];
}

const openRooms = new Map<string, Room>();
const joiningRooms = new Map<string, Room[]>();

io.on("connection", (socket) => {
  socket.on("new_come", (id: string) => {
    socket.join("server");
    socket.emit("new_come", JSON.stringify(Object.fromEntries(openRooms)));
  });

  socket.on("renewal", (id: string) => {
    const openRoomsObj: OpenRoomsObj = {};
    for (const [key, value] of openRooms) {
      openRoomsObj[key] = {
        room: value.room,
        clients: Array.from(value.clients),
      };
    }
    const joiningRoomsObj: JoiningRoomsObj[] = [];
    joiningRooms.get(id)?.map((room: Room, index: number, array: Room[]) =>
      joiningRoomsObj.push({
        room: room.room,
        clients: Array.from(room.clients),
      })
    );

    socket.emit(
      "renewal",
      JSON.stringify(openRoomsObj),
      JSON.stringify(joiningRoomsObj)
    );
  });

  socket.on("enter_room", (roomName: string, nickName: string, id: string) => {
    const room = openRooms.get(roomName);
    const join = joiningRooms.get(id);

    socket.join(roomName);

    if (room) room.clients.add(id);
    else {
      const clients = new Set<string>();
      clients.add(id);
      openRooms.set(roomName, { room: roomName, clients: clients });
    }

    if (join) {
      let joined = false;
      for (const room of join) {
        if (room.room === roomName) joined = true;
      }

      if (!joined) {
        const clients = new Set<string>();
        clients.add(id);
        join.push({
          room: roomName,
          clients: openRooms.get(roomName)?.clients || clients,
        });
      }
    } else {
      const clients = new Set<string>();
      clients.add(id);

      joiningRooms.set(id, [
        {
          room: roomName,
          clients: openRooms.get(roomName)?.clients || clients,
        },
      ]);

      const openRoomsObj: OpenRoomsObj = {};
      for (const [key, value] of openRooms) {
        openRoomsObj[key] = {
          room: value.room,
          clients: Array.from(value.clients),
        };
      }
      socket.to("server").emit("join", JSON.stringify(openRoomsObj));
    }
  });
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
