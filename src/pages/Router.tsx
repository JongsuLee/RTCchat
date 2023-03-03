import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import EnteredRoom from "./EnteredRoom";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

export default function Router() {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    "ws://localhost:5000/chatRooms"
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home io={socket} />} />
        <Route
          path="/entered_room/:roomName"
          element={<EnteredRoom socket={socket} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
