import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}
const EnteredRoom: React.FC<Props> = ({ socket }) => {
  const { roomName } = useParams();
  const navigate = useNavigate();

  window.onpopstate = (event: PopStateEvent) => {
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  };

  return <div>entered room</div>;
};

export default EnteredRoom;
