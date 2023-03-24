import React, { useEffect, useState } from "react";
import OpenRooms from "@Open/OpenRooms";
import CreateRoom from "@Create/CreateRoom";
import JoiningRooms from "@Join/JoiningRooms";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import { useLocation } from "react-router-dom";

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
  const [selectRoom, setSelectRoom] = useState<string | null>(null);

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
    <div className="border flex w-screen h-screen justify-center border-black">
      <div className="open-rooms w-2/5 h-4/5 mr-40 my-auto border border-black">
        <OpenRooms rooms={openRooms} setSelectRoom={setSelectRoom} />
      </div>
      <div className="my-rooms w-1/5 h-4/5 my-auto border border-black">
        {socket && <CreateRoom socket={socket} selectRoom={selectRoom} />}
        <JoiningRooms rooms={joiningRooms} />
      </div>
    </div>
  );
};

export default Home;
