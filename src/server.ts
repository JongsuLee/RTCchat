import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
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
  host: string;
  clients: Set<string>;
}
interface JoiningRoom extends Room {
  nickName: string;
}
interface OpenRoomsObj {
  [key: string]: object;
}
interface JoiningRoomsObj {
  room: string;
  nickName: string;
  clients: string[];
}

const openRooms = new Map<string, Room>();
const joiningRooms = new Map<string, JoiningRoom[]>();

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
    joiningRooms
      .get(id)
      ?.map((room: JoiningRoom, index: number, array: JoiningRoom[]) =>
        joiningRoomsObj.push({
          room: room.room,
          nickName: room.nickName,
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
      openRooms.set(roomName, { room: roomName, host: id, clients: clients });
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
          host: openRooms.get(roomName)?.host || "",
          nickName: nickName,
          clients: openRooms.get(roomName)?.clients || clients,
        });
      }
    } else {
      const clients = new Set<string>();
      clients.add(id);

      joiningRooms.set(id, [
        {
          room: roomName,
          host: openRooms.get(roomName)?.host || "",
          nickName: nickName,
          clients: openRooms.get(roomName)?.clients || clients,
        },
      ]);

      const openRoomsObj: OpenRoomsObj = {};
      for (const [key, value] of openRooms) {
        openRoomsObj[key] = {
          room: value.room,
          host: value.host,
          clients: Array.from(value.clients),
        };
      }
      socket.to("server").emit("join", JSON.stringify(openRoomsObj));
    }
  });

  socket.on("leave_room", (roomName: string, id: string) => {
    const room = openRooms.get(roomName);
    const join = joiningRooms.get(id);

    socket.leave(roomName);

    room?.clients.delete(id);
    if (room && room.clients.size === 0) openRooms.delete(roomName);
    if (join) {
      for (let i = 0; i < join?.length; i++) {
        if (join[i].room === roomName) join.splice(i, 1);
      }
    }
    const openRoomsObj: OpenRoomsObj = {};
    for (const [key, value] of openRooms) {
      openRoomsObj[key] = {
        room: value.room,
        clients: Array.from(value.clients),
      };
    }
    socket.to("server").emit("join", JSON.stringify(openRoomsObj));
  });

  socket.on("entered", (roomName: string, id: string) => {
    const room = joiningRooms.get(id);

    if (room) {
      for (let i = 0; i < room.length; i++) {
        if (room[i].room === roomName)
          socket.emit("entered", room[i].host, room[i].nickName);
      }
    }

    socket.to(roomName).emit("new_peer", id);
  });

  socket.on("origin_peer", (peers: string[], id: string) => {
    socket.join(id);
    socket.to(id).emit("origin_peer", peers);
  });

  socket.on("offer", (offer: RTCSessionDescriptionInit, roomName: string) => {
    console.log("offer:", socket.id);

    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer: RTCSessionDescriptionInit, host: string) => {
    io.sockets.get(host)?.emit("answer", answer);
  });

  socket.on(
    "message",
    (roomName: string, nickName: string, message: string) => {
      socket.to(roomName).emit("message", nickName, message);
    }
  );
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
