import React, { useEffect, useState } from "react";

interface Props {
  width: number;
  height: number;
  myStream: MediaStream;
  muted: boolean;
  speakerId: string | null;
}

const MyFace: React.FC<Props> = ({
  width,
  height,
  myStream,
  muted,
  speakerId,
}) => {
  useEffect(() => {
    const myFace = document.getElementById("my-face") as HTMLMediaElement;
    if (myFace) {
      myFace.srcObject = myStream;
      if (muted) myFace.muted = muted;
      else {
        if (speakerId) (myFace as any).setSinkId(speakerId);
        else (myFace as any).setSinkId("default");
      }
    }
  }, [myStream, speakerId]);

  return (
    <video id="my-face" autoPlay playsInline width={width} height={height} />
  );
};

export default MyFace;
