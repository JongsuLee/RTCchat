import React, { Dispatch, SetStateAction } from "react";

interface Speaker {
  label: string;
  id: string;
}

export async function getCameras(myStream: MediaStream | null) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const curCamera = myStream?.getVideoTracks()[0];
  const select = document.getElementById("cameras");

  if (curCamera) {
    const options = select?.getElementsByTagName("option");
    if (options)
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (curCamera.label === option.label) option.selected = true;
      }
  } else {
    devices.map((device) => {
      if (device.kind === "videoinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.innerText = device.label;
        select?.appendChild(option);
      }
    });
  }
}

export async function getSpeakers(speaker: Speaker | null) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const select = document.getElementById("speakers");

  if (speaker) {
    const options = select?.getElementsByTagName("option");
    if (options)
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (speaker.label === option.label) option.selected = true;
      }
  } else {
    devices.map((device) => {
      if (device.kind === "audiooutput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.innerText = device.label;
        select?.appendChild(option);
      }
    });
  }
}

export async function getMics(myStream: MediaStream | null) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const curMic = myStream?.getAudioTracks()[0];
  const select = document.getElementById("mics");

  if (curMic) {
    const options = select?.getElementsByTagName("option");
    if (options)
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (curMic.label === option.label) option.selected = true;
      }
  } else {
    devices.map((device) => {
      if (device.kind === "audioinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.innerText = device.label;
        select?.appendChild(option);
      }
    });
  }
}

export async function getMedia(
  cameraId: string | null,
  micId: string | null,
  muted: boolean,
  cameraState: boolean,
  setMyStream: React.Dispatch<SetStateAction<MediaStream | null>>
) {
  const audioConstraints = micId ? { deviceId: { exact: micId } } : true;
  const videoConstraints = cameraId
    ? { deviceId: { exact: cameraId } }
    : { facingMode: "user" };
  const mediaOption = { audio: audioConstraints, video: videoConstraints };
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
    getCameras(myStream);
    setMyStream(myStream);
  } catch (error) {
    console.log(error);
  }
}

export function handleMute(
  muted: boolean,
  setMuted: React.Dispatch<SetStateAction<boolean>>,
  setMuteBtn: React.Dispatch<SetStateAction<string>>
) {
  setMuted(!muted);
  if (muted) setMuteBtn("Mute");
  else setMuteBtn("UnMute");
}

export function handleCamera(
  cameraState: boolean,
  setCameraState: React.Dispatch<SetStateAction<boolean>>,
  setCameraBtn: React.Dispatch<SetStateAction<string>>
) {
  setCameraState(!cameraState);
  if (cameraState) setCameraBtn("CameraOFF");
  else setCameraBtn("CameraON");
}
