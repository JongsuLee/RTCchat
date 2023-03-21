import { resolve } from "path";
import React, {
  ChangeEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import {
  getCameras,
  getMedia,
  getMics,
  getSpeakers,
  handleCamera,
  handleMute,
} from "./MediaSet";
import MyFace from "./MyFace";
import PeerFace from "./PeerFace";

interface Client {
  id: string;
  nickName: string;
}

interface Peers {
  [id: string]: RTCPeerConnection;
}

interface PeerStream {
  peer: Client;
  stream: MediaStream;
}

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomName: string;
  host: string;
  clients: Client[];
  muted: boolean;
  setMuted: React.Dispatch<SetStateAction<boolean>>;
  cameraState: boolean;
  setCameraState: React.Dispatch<SetStateAction<boolean>>;
  cameraId: string | null;
  setCameraId: React.Dispatch<SetStateAction<string | null>>;
  speakerId: string | null;
  setSpeakerId: React.Dispatch<SetStateAction<string | null>>;
  micId: string | null;
  setMicId: React.Dispatch<SetStateAction<string | null>>;
  myStream: MediaStream | null;
  leave: string | null;
}

const FaceConnection: React.FC<Props> = ({
  socket,
  roomName,
  host,
  clients,
  muted,
  setMuted,
  cameraState,
  setCameraState,
  cameraId,
  setCameraId,
  speakerId,
  setSpeakerId,
  micId,
  setMicId,
  myStream,
  leave,
}) => {
  const peers = useRef<Peers>({});
  const [peerStreams, setPeerStreams] = useState<PeerStream[]>([]);
  const navigate = useNavigate();

  // Device Setting
  async function handleSelectCamera(event: ChangeEvent<HTMLSelectElement>) {
    setCameraId(event.target.value);
  }

  function handleSelectSpeaker(event: ChangeEvent<HTMLSelectElement>) {
    setSpeakerId(event.target.value);
  }

  function handleSelectMic(event: ChangeEvent<HTMLSelectElement>) {
    setMicId(event.target.value);
  }

  function handleMuteBtn() {
    handleMute(muted, setMuted, myStream);
  }

  function handleCameraBtn() {
    handleCamera(cameraState, setCameraState, myStream);
  }

  // RTC Connection
  function makeConnection(to: string, stream: MediaStream, newJoin: boolean) {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    peers.current = { ...peers.current, [to]: peer };

    peer.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("ice", event.candidate, to, socket.id);
        console.log("sent ice to", to);
      }
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      clients.forEach((client) => {
        if (client.id === to) {
          setPeerStreams((prevPeerStreams) =>
            prevPeerStreams.filter((peerStream) => peerStream.peer.id !== to)
          );
          setPeerStreams((prevPeerStreams) => [
            ...prevPeerStreams,
            { peer: client, stream: event.streams[0] },
          ]);
        }
      });
    };

    peer.addEventListener("track", (event) => console.log);

    if (newJoin) {
      peer.createOffer().then((offer) => {
        console.log("created offer");
        peer.setLocalDescription(offer);
        socket.emit("offer", offer, to, socket.id);
        console.log("sent offer");
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
            console.log("created answer");
            peer.setLocalDescription(answer);
            socket.emit("answer", answer, from, socket.id);
            console.log("sent answer");
            console.log("afterset peer:", peer);
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
    getCameras(null, null);
    getSpeakers(null);
    getMics(null, null);
  }, []);

  useEffect(() => {
    getCameras(myStream, cameraId);
    getSpeakers(speakerId);
    getMics(myStream, micId);
    console.log("muted:", muted);
  }, [cameraId, micId, speakerId]);

  useEffect(() => {
    if (myStream && clients.length > 1) {
      const newCome = clients[clients.length - 1].id;

      if (socket.id === newCome) {
        clients.map((client) => {
          if (client.id !== socket.id)
            makeConnection(client.id, myStream, true);
        });
      } else {
        makeConnection(newCome, myStream, false);
      }
    }

    if (leave) {
      const tos = Object.keys(peers.current);
      tos.forEach((key) => {
        if (key === leave) peers.current[key].close();
      });
      setPeerStreams(
        peerStreams.filter((peerStream) => peerStream.peer.id !== leave)
      );
    }
  }, [clients]);

  return (
    <>
      <div className="faces">
        {myStream && <MyFace myStream={myStream} muted={true} />}
        {peerStreams.length > 0 &&
          peerStreams.map((peerStream, idx) => (
            <PeerFace
              key={idx}
              peerStream={peerStream}
              speakerId={speakerId}
              idx={idx}
            />
          ))}
      </div>
      <div className="select-options">
        <select id="cameras" onChange={handleSelectCamera} />
        <select id="speakers" onChange={handleSelectSpeaker} />
        <select id="mics" onChange={handleSelectMic} />
      </div>
      <div className="control-tracks">
        <button onClick={handleMuteBtn}>{muted ? "UnMute" : "Mute"}</button>
        <button onClick={handleCameraBtn}>
          {cameraState ? "CameraOFF" : "CameraON"}
        </button>
      </div>
    </>
  );
};

export default FaceConnection;
