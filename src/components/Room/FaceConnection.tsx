import React, { ChangeEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import MyFace from "./MyFace";
import PeerFace from "./PeerFace";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  peers: Set<string>;
  roomName: string;
  host: string;
}

const FaceConnection: React.FC<Props> = ({ socket, peers, roomName, host }) => {
  const [muteBtn, setMuteBtn] = useState<string>("UnMute");
  const [cameraBtn, setCameraBtn] = useState<string>("CameraOFF");
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraState, setCameraState] = useState<boolean>(true);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream>();
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

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
  function makeConnection(peers: Set<string>) {
    const urls: string[] = ["stun:stun.l.google.com:19302"];
    for (let i = 1; i < peers.size; i++) {
      urls.push(`stun:stun${i}.l.google.com:19302`);
    }
    setPeerConnection(
      new RTCPeerConnection({
        iceServers: [
          {
            urls: urls,
          },
        ],
      })
    );
  }

  async function createOffer(peerConnection: RTCPeerConnection) {
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
    console.log("sent offer");
  }

  async function createAnswer(
    peerConnection: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
  ) {
    peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, host);
    console.log("sent answer");
  }
  async function receiveAnswer(
    peerConnection: RTCPeerConnection,
    answer: RTCSessionDescriptionInit
  ) {
    await peerConnection.setRemoteDescription(answer);
  }

  useEffect(() => {
    getMedia(cameraId);
    makeConnection(peers);
    if (peers.size > 1 && peerConnection && socket.id === host) {
      createOffer(peerConnection);
      socket.on("answer", (answer: RTCSessionDescriptionInit) => {
        console.log("received answer");
        receiveAnswer(peerConnection, answer);
      });
    }
    // Socket Code
    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        console.log("received offer");
        createAnswer(peerConnection, offer);
      }
    });
  }, [muted, cameraState, cameraId, peers]);

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
