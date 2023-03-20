import React, { ChangeEvent, SetStateAction, useEffect } from "react";
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

interface Props {
  setReadyToMedia: React.Dispatch<SetStateAction<boolean>>;
  muteBtn: string;
  setMuteBtn: React.Dispatch<SetStateAction<string>>;
  cameraBtn: string;
  setCameraBtn: React.Dispatch<SetStateAction<string>>;
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
  setMyStream: React.Dispatch<SetStateAction<MediaStream | null>>;
}

const MediaSetRoom: React.FC<Props> = ({
  setReadyToMedia,
  muteBtn,
  setMuteBtn,
  cameraBtn,
  setCameraBtn,
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
  setMyStream,
}) => {
  function handleSelectCamera(event: ChangeEvent<HTMLSelectElement>) {
    setCameraId(event.target.value);
  }

  function handleSelectSpeaker(event: ChangeEvent<HTMLSelectElement>) {
    setSpeakerId(event.target.value);
  }

  function handleSelectMic(event: ChangeEvent<HTMLSelectElement>) {
    setMicId(event.target.value);
  }

  function handleMuteBtn() {
    handleMute(muted, setMuted, setMuteBtn, myStream);
  }

  function handleCameraBtn() {
    handleCamera(cameraState, setCameraState, setCameraBtn, myStream);
  }

  function readyHandler() {
    setReadyToMedia(true);
  }

  useEffect(() => {
    getCameras(myStream, cameraId);
    getSpeakers(speakerId);
    getMics(myStream, micId);
    getMedia(
      cameraId,
      micId,
      speakerId,
      muted,
      cameraState,
      setMyStream,
      setSpeakerId
    );
  }, [muted, cameraState, cameraId, micId, speakerId]);

  return (
    <>
      <div className="faces">
        {myStream && <MyFace myStream={myStream} speakerId={speakerId} />}
      </div>
      <div className="select-options">
        <select id="cameras" onChange={handleSelectCamera} />
        <select id="speakers" onChange={handleSelectSpeaker} />
        <select id="mics" onChange={handleSelectMic} />
      </div>
      <div className="control-tracks">
        <button onClick={handleMuteBtn}>{muteBtn}</button>
        <button onClick={handleCameraBtn}>{cameraBtn}</button>
      </div>
      <button onClick={readyHandler}>MediaSetRoom</button>
    </>
  );
};
export default MediaSetRoom;
