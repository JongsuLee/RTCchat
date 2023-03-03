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
interface Props {
  io: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const Home: React.FC<Props> = ({ io }) => {
  const id = useLocation().state ? useLocation().state.id : null;
  let renewaled: boolean = false;
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [openRooms, setOpenRooms] = useState<Room[] | null>(null);
  const [joiningRooms, setJoiningRooms] = useState<Room[] | null>(null);

  socket &&
    socket.on("connect", () => {
      socket.emit("new_come", socket.id);
      socket.on("new_come", (data: string) => {
        setOpenRooms(JSON.parse(data));
      });
      socket.on("renewal", (data1: string, data2: string) => {
        console.log(data1);
        renewaled = true;
        setOpenRooms(JSON.parse(data1));
        setJoiningRooms(JSON.parse(data2));
      });
    });
  !renewaled && socket && socket.emit("renewal", id);
  console.log(id);

  useEffect(() => {
    setSocket(io);
  }, [id]);

  openRooms && console.log(openRooms);
  joiningRooms && console.log(joiningRooms);

  return (
    <>
      <OpenRooms rooms={openRooms} />
      {socket && <CreateRoom socket={socket} />}
      <JoiningRooms />
    </>
  );
};

export default Home;
