import FaceConnection from "@Room/FaceConnection";
import Message from "@Room/Message";
import MessageForm from "@Room/MessageForm";
import Messages from "@Room/Messages";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const EnteredRoom: React.FC<Props> = ({ socket }) => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [nickName, setNickName] = useState<string | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [peerConnected, setPeerConnected] = useState<Set<string>>(
    new Set([socket.id])
  );
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const [count, setCount] = useState<number>(0);

  // Header Functions
  window.onpopstate = (event: PopStateEvent) => {
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  };

  function handleGoBack() {
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  }

  function handleLeave() {
    roomName && socket.emit("leave_room", roomName, socket.id);
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  }

  // Socket Code
  socket.on("new_peer", (id: string) => {
    socket.emit("origin_peer", [...peerConnected], id);
    setPeerConnected(new Set([...peerConnected, id]));
  });

  socket.on("origin_peer", (peers: string[]) => {
    setPeerConnected(new Set([...peerConnected, ...peers]));
  });

  socket.on("message", (nickName: string, message: string) => {
    setCount(count + 1);
    setMessages([
      ...messages,
      <Message
        type="peer"
        nickName={nickName}
        message={message}
        key={`${nickName}-${count}`}
      />,
    ]);
  });

  useEffect(() => {
    roomName && socket.emit("entered", roomName, socket.id);
    socket.on("entered", (host, nickName) => {
      setHost(host);
      setNickName(nickName);
    });
  }, []);

  return (
    <>
      <div className="header">
        <button onClick={handleGoBack}>뒤로가기</button>
        <div>{roomName}</div>
        <button onClick={handleLeave}>나가기</button>
      </div>
      <div className="messanger">
        <div className="face-talk">
          {socket && roomName !== undefined && host && (
            <FaceConnection
              socket={socket}
              peers={peerConnected}
              roomName={roomName}
              host={host}
            />
          )}
        </div>
        <div className="message-talk">
          <Messages messages={messages} />
          {roomName !== undefined && (
            <MessageForm
              socket={socket}
              roomName={roomName}
              nickName={nickName}
              messages={messages}
              setMessages={setMessages}
              count={count}
              setCount={setCount}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EnteredRoom;
