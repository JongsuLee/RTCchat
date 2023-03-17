import { resolve } from "path";
import React, {
  ChangeEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import { getCameras, handleCamera, handleMute } from "./MediaSet";
import MyFace from "./MyFace";
import PeerFace from "./PeerFace";

interface Client {
  id: string;
  nickName: string;
}

interface Peers {
  [id: string]: RTCPeerConnection;
}

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomName: string;
  host: string;
  clients: Client[];
  muteBtn: string;
  setMuteBtn: React.Dispatch<SetStateAction<string>>;
  cameraBtn: string;
  setCameraBtn: React.Dispatch<SetStateAction<string>>;
  muted: boolean;
  setMuted: React.Dispatch<SetStateAction<boolean>>;
  cameraState: boolean;
  setCameraState: React.Dispatch<SetStateAction<boolean>>;
  setCameraId: React.Dispatch<SetStateAction<string | null>>;
  myStream: MediaStream | null;
}

const FaceConnection: React.FC<Props> = ({
  socket,
  roomName,
  host,
  clients,
  muteBtn,
  setMuteBtn,
  cameraBtn,
  setCameraBtn,
  muted,
  setMuted,
  cameraState,
  setCameraState,
  setCameraId,
  myStream,
}) => {
  const peers = useRef<Peers>({});
  const countPeers = useRef(0);

  // Device Setting
  async function handleSelectCamera(event: ChangeEvent<HTMLSelectElement>) {
    setCameraId(event.target.value);
  }

  function handleMuteBtn() {
    handleMute(muted, setMuted, setMuteBtn);
  }

  function handleCameraBtn() {
    handleCamera(cameraState, setCameraState, setCameraBtn);
  }

  // RTC Connection
  function makeConnection(to: string, stream: MediaStream, newJoin: boolean) {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    peers.current = { ...peers.current, [to]: peer };
    countPeers.current += 1;
    console.log(peers);

    peer.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("ice", event.candidate, to, socket.id);
        console.log("sent ice to", to);
      }
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => console.log(event);

    peer.addEventListener("track", (event) => console.log);

    if (newJoin) {
      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer).then(() => {
          console.log("created offer");
          socket.emit("offer", offer, to, socket.id);
          console.log("sent offer");
        });
      });
    }
  }

  socket.on("offer", (offer, from) => {
    if (myStream) {
      let peer = peers.current[from];
      if (peer)
        peer.setRemoteDescription(offer).then(() => {
          console.log("received offer");
          peer.createAnswer().then((answer) => {
            peer.setLocalDescription(answer).then(() => {
              console.log("created answer");
              socket.emit("answer", answer, from, socket.id);
              console.log("sent answer");
            });
          });
        });
    }
  });

  socket.on("answer", (answer, from) => {
    let peer = peers.current[from];
    if (peer)
      peer.setRemoteDescription(answer).then(() => {
        console.log("received answer");
        console.log("afterset peer:", peer);
      });
  });

  socket.on("ice", (ice, from) => {
    let peer = peers.current[from];
    if (peer)
      peer.addIceCandidate(ice).then(() => {
        console.log("received ice");
      });
  });

  useEffect(() => {
    getCameras(null);
    getCameras(myStream);

    if (clients.length > 1 && myStream) {
      const newCome = clients[clients.length - 1].id;
      if (socket.id === newCome) {
        for (let i = 0; i < clients.length - 1; i++) {
          const to = clients[i].id;
          makeConnection(to, myStream, true);
        }
      } else {
        makeConnection(newCome, myStream, false);
      }
    }
  }, [clients]);

  return (
    <>
      <div className="faces">
        {myStream && <MyFace myStream={myStream} speakerId={null} />}
        <PeerFace />
      </div>
      <div className="select-options">
        <select id="cameras" onChange={handleSelectCamera} />
      </div>
      <div className="control-tracks">
        <button onClick={handleMuteBtn}>{muteBtn}</button>
        <button onClick={handleCameraBtn}>{cameraBtn}</button>
      </div>
    </>
  );
};

export default FaceConnection;
