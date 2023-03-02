import React from "react";
import OpenRooms from "@Open/OpenRooms";
import CreateRoom from "@Create/CreateRoom";
import JoiningRooms from "@Join/JoiningRooms";

const Home: React.FC = () => {
  return (
    <>
      <OpenRooms />
      <CreateRoom />
      <JoiningRooms />
    </>
  );
};

export default Home;
