import React, { Dispatch, SetStateAction } from "react";

interface Speaker {
  label: string;
  id: string;
}

export async function getCameras(
  myStream: MediaStream | null,
  cameraId: string | null
) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const curCamera = myStream?.getVideoTracks()[0];
  const select = document.getElementById("cameras");

  if (cameraId) {
    const options = select?.getElementsByTagName("option");
    if (options) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === cameraId) option.selected = true;
      }
    }
  } else {
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
}

export async function getSpeakers(speakerId: string | null) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const select = document.getElementById("speakers");

  if (speakerId) {
    const options = select?.getElementsByTagName("option");
    if (options) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === speakerId) option.selected = true;
      }
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

export async function getMics(
  myStream: MediaStream | null,
  micId: string | null
) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const curMic = myStream?.getAudioTracks()[0];
  const select = document.getElementById("mics");

  if (micId) {
    const options = select?.getElementsByTagName("option");
    if (options) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === micId) option.selected = true;
      }
    }
  } else {
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
}

export async function getMedia(
  cameraId: string | null,
  micId: string | null,
  speakerId: string | null,
  muted: boolean,
  cameraState: boolean,
  setMyStream: React.Dispatch<SetStateAction<MediaStream | null>>,
  setSpeakerId: React.Dispatch<SetStateAction<string | null>>
) {
  const audioConstraints = micId ? { deviceId: { exact: micId } } : true;
  const videoConstraints = cameraId
    ? { deviceId: { exact: cameraId } }
    : { facingMode: "user" };
  const mediaOption = { audio: audioConstraints, video: videoConstraints };
  try {
    const myStream = await navigator.mediaDevices.getUserMedia(mediaOption);
    myStream.getAudioTracks()[0].enabled = !muted;
    getCameras(myStream, cameraId);
    getMics(myStream, micId);
    setMyStream(myStream);
    !speakerId && setSpeakerId("default");
  } catch (error) {
    console.log(error);
  }
}

export function handleMute(
  muted: boolean,
  setMuted: React.Dispatch<SetStateAction<boolean>>,
  myStream: MediaStream | null
) {
  if (myStream) myStream.getAudioTracks()[0].enabled = muted;
  setMuted(!muted);
}

export function handleCamera(
  cameraState: boolean,
  setCameraState: React.Dispatch<SetStateAction<boolean>>,
  myStream: MediaStream | null
) {
  if (myStream) myStream.getVideoTracks()[0].enabled = !cameraState;
  setCameraState(!cameraState);
}
