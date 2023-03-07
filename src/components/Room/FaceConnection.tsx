import React, { ChangeEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import MyFace from "./MyFace";
import PeerFace from "./PeerFace";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  peerConnected: string[];
  roomName: string;
  host: string;
}

const FaceConnection: React.FC<Props> = ({
  socket,
  peerConnected,
  roomName,
  host,
}) => {
  const [muteBtn, setMuteBtn] = useState<string>("UnMute");
  const [cameraBtn, setCameraBtn] = useState<string>("CameraOFF");
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraState, setCameraState] = useState<boolean>(true);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream>();
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  // Device Setting
  async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const curCamera = myStream?.getVideoTracks()[0];

    const select = document.getElementById("cameras");
    devices.map(
      (device: MediaDeviceInfo, index: number, array: MediaDeviceInfo[]) => {
        if (device.kind === "videoinput") {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.innerText = device.label;
          if (curCamera && curCamera.label === device.label) option.selected;
          select?.appendChild(option);
        }
      }
    );
  }

  async function getMedia(cameraId: string | null) {
    let mediaOption: MediaStreamConstraints;
    if (cameraId) {
      mediaOption = {
        audio: true,
        video: { deviceId: { exact: cameraId } },
      };
    } else {
      mediaOption = {
        audio: true,
        video: { facingMode: "user" },
      };
    }
    try {
      const myStream = await navigator.mediaDevices.getUserMedia(mediaOption);
      myStream
        .getAudioTracks()
        .forEach(
          (track: MediaStreamTrack, index: number, array: MediaStreamTrack[]) =>
            (track.enabled = !muted)
        );
      myStream
        .getVideoTracks()
        .forEach(
          (track: MediaStreamTrack, index: number, array: MediaStreamTrack[]) =>
            (track.enabled = cameraState)
        );

      if (cameraId === null) await getCameras();
      setMyStream(myStream);
    } catch (error) {
      console.log(error);
    }
  }

  function handleMute() {
    setMuted(!muted);
    if (muted) setMuteBtn("Mute");
    else setMuteBtn("UnMute");
  }

  function handleCamera() {
    setCameraState(!cameraState);
    if (cameraState) setCameraBtn("CameraOFF");
    else setCameraBtn("CameraON");
  }

  async function handleSelectCamera(event: ChangeEvent<HTMLSelectElement>) {
    setCameraId(event.target.value);
    await getMedia(cameraId);
  }

  // RTC Connection
  let peer: RTCPeerConnection;
  function makePeerConnection(to: string): RTCPeerConnection {
    peer = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    const newPeers = new Map(peers);
    newPeers.set(to, peer);
    setPeers(newPeers);

    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) socket.emit("ice", event.candidate, to, socket.id);
      console.log("sent ice to", to);
    };

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStreams([...remoteStreams, remoteStream]);
    };

    return peer;
  }

  async function createOffer(id: string, peer: RTCPeerConnection) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", offer, id, socket.id);
    console.log("sent offer");
  }

  async function createAnswer(to: string) {
    if (peer) {
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await new Promise<void>((resolve) => {
        socket.emit("answer", answer, to, socket.id);
        socket.on("answered", (answered: RTCSessionDescriptionInit) => {
          if (answer === answered) resolve();
        });
      });
      console.log("sent answer");
    }
  }

  async function receiveAnswer(
    answer: RTCSessionDescriptionInit,
    from: string
  ) {
    if (peer) {
      await new Promise<void>(async (resolve) => {
        await peer.setRemoteDescription(answer);
        peer.addEventListener("signalingstatechange", function hanlder() {
          if (peer.signalingState === "stable") {
            socket.emit("answered", from, answer);
            resolve();
          }
        });
      });
    }
  }

  async function receiveIce(ice: RTCIceCandidate, from: string) {
    if (peer) await peer.addIceCandidate(ice);
  }

  // Socket Code
  socket.on("offer", async (offer: RTCSessionDescriptionInit, from: string) => {
    peer = makePeerConnection(from);

    if (peer) {
      console.log("received offer:", offer);
      await peer.setRemoteDescription(offer);
      createAnswer(from);
    }
  });

  socket.on(
    "answer",
    async (answer: RTCSessionDescriptionInit, from: string) => {
      await receiveAnswer(answer, from);
    }
  );

  socket.on("ice", (ice: RTCIceCandidate, from: string) => {
    receiveIce(ice, from);
  });

  useEffect(() => {
    getMedia(cameraId);
    if (socket.id !== host && peerConnected.length > 1) {
      for (let i = 0; i < peerConnected.length; i++) {
        if (peerConnected[i] === socket.id) continue;
        const peer = makePeerConnection(socket.id);
        createOffer(peerConnected[i], peer);
      }
    }
  }, [muted, cameraState, cameraId]);

  return (
    <>
      <div className="faces">
        {myStream && <MyFace myStream={myStream} />}
        <PeerFace />
      </div>
      <div className="select-options">
        <select id="cameras" onChange={handleSelectCamera} />
      </div>
      <div className="control-tracks">
        <button onClick={handleMute}>{muteBtn}</button>
        <button onClick={handleCamera}>{cameraBtn}</button>
      </div>
    </>
  );
};

export default FaceConnection;
