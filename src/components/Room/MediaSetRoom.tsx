import React, { ChangeEvent, SetStateAction, useEffect } from "react";
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

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomName: string | undefined;
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
  socket,
  roomName,
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
  const navigate = useNavigate();

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

  function handleLeave() {
    roomName && socket.emit("leave_room", roomName, socket.id);
    sessionStorage.setItem("renewal", "true");
    myStream && myStream.getTracks().forEach((track) => track.stop());
    navigate("/");
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
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="meida-set w-2/3 flex justify-around">
        <div className="faces border rounded-3xl p-10">
          {myStream && (
            <MyFace
              width={600}
              height={600}
              myStream={myStream}
              muted={false}
              speakerId={speakerId}
            />
          )}
        </div>
        <div className="select-mediaset w-2/5 p-10 flex flex-col items-center justify-around border rounded-3xl">
          <div className="select-options w-full h-40 flex flex-col justify-between">
            <div className="w-full flex justify-between border-b-2 pb-4 hover:bg-slate-300">
              <div className="mr-4 font-bold text-lg">Camera</div>
              <select
                className="w-80"
                id="cameras"
                onChange={handleSelectCamera}
              />
            </div>
            <div className="w-full flex justify-between border-b-2 pb-4 hover:bg-slate-300">
              <div className="mr-4 font-bold text-lg">Speaker</div>
              <select
                className="w-80"
                id="speakers"
                onChange={handleSelectSpeaker}
              />
            </div>
            <div className="w-full flex justify-between border-b-2 pb-4 hover:bg-slate-300">
              <div className="mr-4 font-bold text-lg">Mic</div>
              <select className="w-80" id="mics" onChange={handleSelectMic} />
            </div>
          </div>
          <div className="control-tracks w-2/3 flex justify-between">
            <button
              className="font-bold text-lg border-2 rounded-full p-4 hover:bg-slate-600 hover:text-white"
              onClick={handleMuteBtn}>
              {muted ? "UnMute" : "Mute"}
            </button>
            <button
              className="font-bold text-lg border-2 rounded-full p-4 hover:bg-slate-600 hover:text-white"
              onClick={handleCameraBtn}>
              {cameraState ? "CameraOFF" : "CameraON"}
            </button>
          </div>
        </div>
      </div>
      <div className="set-ready-or-leave w-1/3 flex justify-around mt-10">
        <button
          className="font-bold text-2xl p-6 border rounded-full hover:bg-slate-600 hover:text-white"
          onClick={readyHandler}>
          MediaSetRoom
        </button>
        <button
          className="font-bold text-2xl p-6 border rounded-full hover:bg-slate-600 hover:text-white"
          onClick={handleLeave}>
          Leave
        </button>
      </div>
    </div>
  );
};
export default MediaSetRoom;
