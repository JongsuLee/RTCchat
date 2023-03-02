import React, { useEffect, useState } from "react";
import OpenRooms from "@Open/OpenRooms";
import CreateRoom from "@Create/CreateRoom";
import JoiningRooms from "@Join/JoiningRooms";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

const Home: React.FC = () => {
  const [openRooms, setOpenRooms] = useState(new Map());
  const [joiningRooms, setJoiningRooms] = useState([]);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      "ws://localhost:5000/chatRooms"
    );

    socket.on("connect", () => {
      socket.emit("new_come", socket.id);
      socket.on("new_come", (data: string) => {
        const dataMap = new Map();
        Object.entries(JSON.parse(data)).forEach((key: any) => {
          dataMap.set(key[1][0], key[1][1]);
        });
        setOpenRooms(dataMap);
      });
    });
  }, []);
  console.log("openRooms");
  console.log(openRooms);

  return (
    <>
      <OpenRooms />
      <CreateRoom />
      <JoiningRooms />
    </>
  );
};

export default Home;
