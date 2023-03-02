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

const Home: React.FC = () => {
  const [openRooms, setOpenRooms] = useState<Room[] | null>(null);
  const [joiningRooms, setJoiningRooms] = useState([]);
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  useEffect(() => {
    const socket = io("ws://localhost:5000/chatRooms");
    setSocket(socket);
  }, []);
  socket &&
    socket.on("connect", () => {
      socket.emit("new_come", socket.id);
      socket.on("new_come", (data: string) => {
        setOpenRooms(JSON.parse(data));
      });
    });

  return (
    <>
      <OpenRooms rooms={openRooms} />
      {socket && <CreateRoom socket={socket} />}
      <JoiningRooms />
    </>
  );
};

export default Home;
