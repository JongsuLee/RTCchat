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
import { join } from "path";

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

interface Client {
  id: string;
  nickName: string;
}

interface Room {
  room: string;
  host: string;
  clients: Client[];
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
  clients: Client[];
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
        host: value.host,
        clients: value.clients,
      };
    }

    const joiningRoomsObj: JoiningRoomsObj[] = [];
    joiningRooms.get(id)?.map((room) =>
      joiningRoomsObj.push({
        room: room.room,
        nickName: room.nickName,
        clients: room.clients,
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
    let joins = joiningRooms.get(id);
    const client = { id: id, nickName: nickName };

    socket.join(roomName);

    if (room) {
      let joined = false;
      room.clients.map((client) => {
        if (client.id === id) joined = true;
      });
      if (joined) return;
      else room.clients.push(client);
    } else {
      const clients = new Set<string>();
      clients.add(id);
      openRooms.set(roomName, { room: roomName, host: id, clients: [client] });
    }

    if (joins) {
      let joined = false;
      joins.map((join) => {
        if (join.room === roomName) joined = true;
      });

      if (!joined) {
        joins.push({
          room: roomName,
          host: openRooms.get(roomName)?.host || "",
          nickName: nickName,
          clients: openRooms.get(roomName)?.clients || [client],
        });
      }
    } else {
      joiningRooms.set(id, [
        {
          room: roomName,
          host: openRooms.get(roomName)?.host || "",
          nickName: nickName,
          clients: openRooms.get(roomName)?.clients || [client],
        },
      ]);

      const openRoomsObj: OpenRoomsObj = {};
      for (const [key, value] of openRooms) {
        openRoomsObj[key] = {
          room: value.room,
          host: value.host,
          clients: value.clients,
        };
      }
      socket.to("server").emit("join", JSON.stringify(openRoomsObj));
    }

    joins = joiningRooms.get(id);
    joins?.map((join) => {
      if (join.room === roomName) {
        socket.to(roomName).emit("entered", join);
        socket.emit("entered", join);
      }
    });
  });

  socket.on("leave_room", (roomName: string, id: string) => {
    const room = openRooms.get(roomName);
    const joins = joiningRooms.get(id);

    socket.leave(roomName);

    let idx = 0;
    room?.clients.map((client, index) => {
      if (client.id === id) idx = index;
    });
    room?.clients.splice(idx, 1);
    if (room && room.clients.length === 0) openRooms.delete(roomName);

    joins?.map((join, index) => {
      if (join.room === roomName) idx = index;
    });
    joins?.splice(idx, 1);

    const openRoomsObj: OpenRoomsObj = {};
    for (const [key, value] of openRooms) {
      openRoomsObj[key] = {
        room: value.room,
        host: value.host,
        clients: value.clients,
      };
    }

    const joiningRoomsObj: JoiningRoomsObj[] = [];
    joiningRooms.get(id)?.map((room) =>
      joiningRoomsObj.push({
        room: room.room,
        nickName: room.nickName,
        clients: room.clients,
      })
    );

    socket.emit(
      "renewal",
      JSON.stringify(openRoomsObj),
      JSON.stringify(joiningRoomsObj)
    );
    socket.to("server").emit("join", JSON.stringify(openRoomsObj));
  });

  socket.on(
    "offer",
    (offer: RTCSessionDescriptionInit, to: string, from: string) => {
      io.sockets.get(to)?.emit("offer", offer, from);
    }
  );

  socket.on(
    "answer",
    (answer: RTCSessionDescriptionInit, to: string, from: string) => {
      io.sockets.get(to)?.emit("answer", answer, from);
    }
  );

  socket.on("ice", (ice: RTCIceCandidate, to: string, from: string) => {
    io.sockets.get(to)?.emit("ice", ice, from);
  });

  socket.on(
    "message",
    (roomName: string, nickName: string, message: string) => {
      socket.to(roomName).emit("message", nickName, message);
    }
  );
});

server.listen(5000, () => console.log("Listening to http://localhost:5000"));
