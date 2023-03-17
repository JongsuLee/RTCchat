import React, { ChangeEvent, SetStateAction, useEffect } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import { getMedia, handleCamera, handleMute } from "./MediaSet";
import MyFace from "./MyFace";

interface Speaker {
  label: string;
  id: string;
}

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
  setCameraId: React.Dispatch<SetStateAction<string | null>>;
  speaker: Speaker | null;
  setSpeaker: React.Dispatch<SetStateAction<Speaker | null>>;
  setMicId: React.Dispatch<SetStateAction<string | null>>;
  myStream: MediaStream | null;
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
  setCameraId,
  speaker,
  setSpeaker,
  setMicId,
  myStream,
}) => {
  function handleSelectCamera(event: ChangeEvent<HTMLSelectElement>) {
    setCameraId(event.target.value);
  }

  function handleSelectSpeaker(event: ChangeEvent<HTMLSelectElement>) {
    const label = event.target[event.target.selectedIndex].textContent;
    if (label) setSpeaker({ label: label, id: event.target.value });
  }

  function handleSelectMic(event: ChangeEvent<HTMLSelectElement>) {
    setMicId(event.target.value);
  }

  function handleMuteBtn() {
    handleMute(muted, setMuted, setMuteBtn);
  }

  function handleCameraBtn() {
    handleCamera(cameraState, setCameraState, setCameraBtn);
  }

  function readyHandler() {
    setReadyToMedia(true);
  }

  return (
    <>
      <div className="faces">
        {myStream && (
          <MyFace
            myStream={myStream}
            speakerId={speaker ? speaker.id : "default"}
          />
        )}
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
