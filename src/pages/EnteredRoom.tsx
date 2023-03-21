import FaceConnection from "@Room/FaceConnection";
import { getCameras, getMedia, getMics, getSpeakers } from "@Room/MediaSet";
import MediaSetRoom from "@Room/MediaSetRoom";
import Message from "@Room/Message";
import MessageForm from "@Room/MessageForm";
import Messages from "@Room/Messages";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

interface Client {
  id: string;
  nickName: string;
}

interface Room {
  room: string;
  host: string;
  nickName: string;
  clients: Client[];
}

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const EnteredRoom: React.FC<Props> = ({ socket }) => {
  // Entire Room
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [nickName, setNickName] = useState<string | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  // Media Set
  const [readyToMedia, setReadyToMedia] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [cameraState, setCameraState] = useState<boolean>(true);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [micId, setMicId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  // Message Form
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const [count, setCount] = useState<number>(0);
  const [leave, setLeave] = useState<string | null>(null);

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
    myStream && myStream.getTracks().forEach((track) => track.stop());
    navigate("/");
  }

  // Socket Code

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

  socket.on("leave_room", (id, newClients) => {
    setLeave(id);
    setClients(newClients);
  });

  useEffect(() => {
    socket.on("entered", (room) => {
      setHost(room.host);
      setNickName(room.nickName);
      setClients(room.clients);
    });
  }, []);

  return (
    <>
      {readyToMedia ? (
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
                  roomName={roomName}
                  host={host}
                  clients={clients}
                  muted={muted}
                  setMuted={setMuted}
                  cameraState={cameraState}
                  setCameraState={setCameraState}
                  cameraId={cameraId}
                  setCameraId={setCameraId}
                  speakerId={speaker}
                  setSpeakerId={setSpeaker}
                  micId={micId}
                  setMicId={setMicId}
                  myStream={myStream}
                  leave={leave}
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
      ) : (
        <MediaSetRoom
          setReadyToMedia={setReadyToMedia}
          muted={muted}
          setMuted={setMuted}
          cameraState={cameraState}
          setCameraState={setCameraState}
          cameraId={cameraId}
          setCameraId={setCameraId}
          speakerId={speaker}
          setSpeakerId={setSpeaker}
          micId={micId}
          setMicId={setMicId}
          myStream={myStream}
          setMyStream={setMyStream}
        />
      )}
    </>
  );
};

export default EnteredRoom;
