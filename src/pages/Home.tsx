import React, { useEffect, useState } from "react";
import OpenRooms from "@Open/OpenRooms";
import CreateRoom from "@Create/CreateRoom";
import JoiningRooms from "@Join/JoiningRooms";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import { useLocation } from "react-router-dom";

interface Room {
  room: string;
  clients: string[];
}
interface JoiningRoom extends Room {
  nickName: string;
}
interface Props {
  io: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const Home: React.FC<Props> = ({ io }) => {
  const renewal = sessionStorage.getItem("renewal");
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [openRooms, setOpenRooms] = useState<Room[] | null>(null);
  const [joiningRooms, setJoiningRooms] = useState<JoiningRoom[] | null>(null);

  if (socket) {
    socket.on("connect", () => {
      socket.emit("new_come", socket.id);
      socket.on("new_come", (data: string) => {
        setOpenRooms(JSON.parse(data));
      });
    });

    socket.on("join", (data: string) => {
      setOpenRooms(JSON.parse(data));
    });

    if (renewal === "true") {
      socket.emit("renewal", socket.id);
    }

    socket.on("renewal", (data1: string, data2: string) => {
      sessionStorage.removeItem("renewal");
      setOpenRooms(JSON.parse(data1));
      setJoiningRooms(JSON.parse(data2));
    });
  }

  useEffect(() => {
    setSocket(io);
  }, []);

  return (
    <>
      <OpenRooms rooms={openRooms} />
      {socket && <CreateRoom socket={socket} />}
      <JoiningRooms rooms={joiningRooms} />
    </>
  );
};

export default Home;
