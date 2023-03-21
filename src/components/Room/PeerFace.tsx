import React, { useEffect } from "react";

interface Client {
  id: string;
  nickName: string;
}

interface PeerStream {
  peer: Client;
  stream: MediaStream;
}

interface Props {
  peerStream: PeerStream;
  speakerId: string | null;
  idx: number;
}

const PeerFace: React.FC<Props> = ({ peerStream, speakerId, idx }) => {
  useEffect(() => {
    const peerFace = document.getElementById(
      `peer-face${idx}`
    ) as HTMLMediaElement;
    console.log("peerFace:", speakerId);

    if (peerFace) {
      peerFace.srcObject = peerStream.stream;
      if (speakerId) {
        (peerFace as any).setSinkId(speakerId);
        console.log((peerFace as any).sinkId);
      } else {
        (peerFace as any).setSinkId("default");
        console.log((peerFace as any).sinkId);
      }
    }
  }, [peerStream, speakerId]);

  return (
    <video
      id={`peer-face${idx}`}
      autoPlay
      playsInline
      width={400}
      height={400}
    />
  );
};

export default PeerFace;
