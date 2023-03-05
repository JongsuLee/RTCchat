import React, { useEffect, useState } from "react";

interface Props {
  myStream: MediaStream;
}

const MyFace: React.FC<Props> = ({ myStream }) => {
  useEffect(() => {
    const myFace = document.getElementById("my-face") as HTMLVideoElement;
    if (myFace) myFace.srcObject = myStream;
  }, [myStream]);

  return <video id="my-face" autoPlay playsInline width={400} height={400} />;
};

export default MyFace;
