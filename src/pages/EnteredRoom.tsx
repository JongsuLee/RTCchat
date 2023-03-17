import FaceConnection from "@Room/FaceConnection";
import { getCameras, getMedia, getMics, getSpeakers } from "@Room/MediaSet";
import MediaSetRoom from "@Room/MediaSetRoom";
import Message from "@Room/Message";
import MessageForm from "@Room/MessageForm";
import Messages from "@Room/Messages";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { set, SubmitHandler, useForm } from "react-hook-form";
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

interface Speaker {
  label: string;
  id: string;
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
  const [muteBtn, setMuteBtn] = useState<string>("UnMute");
  const [cameraBtn, setCameraBtn] = useState<string>("CameraOFF");
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraState, setCameraState] = useState<boolean>(true);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [micId, setMicId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  // Message Form
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
    socket.on("entered", (room) => {
      setHost(room.host);
      setNickName(room.nickName);
      setClients(room.clients);
    });
    getCameras(myStream);
    getSpeakers(speaker);
    getMics(myStream);
    getMedia(cameraId, micId, muted, cameraState, setMyStream);
  }, [muted, cameraState, cameraId, micId, speaker]);

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
                  muteBtn={muteBtn}
                  setMuteBtn={setMuteBtn}
                  cameraBtn={cameraBtn}
                  setCameraBtn={setCameraBtn}
                  muted={muted}
                  setMuted={setMuted}
                  cameraState={cameraState}
                  setCameraState={setCameraState}
                  setCameraId={setCameraId}
                  myStream={myStream}
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
          muteBtn={muteBtn}
          setMuteBtn={setMuteBtn}
          cameraBtn={cameraBtn}
          setCameraBtn={setCameraBtn}
          muted={muted}
          setMuted={setMuted}
          cameraState={cameraState}
          setCameraState={setCameraState}
          setCameraId={setCameraId}
          speaker={speaker}
          setSpeaker={setSpeaker}
          setMicId={setMicId}
          myStream={myStream}
        />
      )}
    </>
  );
};

export default EnteredRoom;
