import React, { ChangeEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import MyFace from "./MyFace";
import PeerFace from "./PeerFace";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const FaceConnection: React.FC<Props> = ({ socket }) => {
  const [muteBtn, setMuteBtn] = useState<string>("UnMute");
  const [cameraBtn, setCameraBtn] = useState<string>("CameraOFF");
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraState, setCameraState] = useState<boolean>(true);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream>();
  let peerConnection: RTCPeerConnection;
  function makeConnection() {
    peerConnection = new RTCPeerConnection();
  }

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

  useEffect(() => {
    getMedia(cameraId);
  }, [muted, cameraState]);

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
