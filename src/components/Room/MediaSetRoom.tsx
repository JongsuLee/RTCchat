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
    handleMute(muted, setMuted, myStream);
  }

  function handleCameraBtn() {
    handleCamera(cameraState, setCameraState, myStream);
  }

  function readyHandler() {
    setReadyToMedia(true);
  }

  useEffect(() => {
    getCameras(null, null);
    getSpeakers(null);
    getMics(null, null);
    getMedia(
      cameraId,
      micId,
      speakerId,
      muted,
      cameraState,
      setMyStream,
      setSpeakerId
    );
  }, []);

  useEffect(() => {
    getCameras(myStream, cameraId);
    getSpeakers(speakerId);
    getMics(myStream, micId);
  }, [cameraId, micId, speakerId]);

  return (
    <>
      <div className="faces">
        {myStream && <MyFace myStream={myStream} muted={false} />}
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
      <button onClick={readyHandler}>MediaSetRoom</button>
    </>
  );
};
export default MediaSetRoom;
