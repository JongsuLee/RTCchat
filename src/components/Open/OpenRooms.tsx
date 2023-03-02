import React from "react";

interface Room {
  room: string;
  clients: string[];
}

interface Props {
  rooms: Room[] | null;
}

const OpenRooms: React.FC<Props> = ({ rooms }) => {
  return (
    <>
      <div>Opening Rooms</div>
      {rooms &&
        Object.entries(rooms).map(
          (room: [string, Room], index: number, array: [string, Room][]) => (
            <div key={index}>
              <div>Room: {room[1].room}</div>
              <div>참여인원: {room[1].clients.length}</div>
            </div>
          )
        )}
    </>
  );
};

export default OpenRooms;
