import React from "react";
import { Link } from "react-router-dom";

interface Room {
  room: string;
  nickName: string;
  clients: string[];
}

interface Props {
  rooms: Room[] | null;
}

const JoiningRooms: React.FC<Props> = ({ rooms }) => {
  return (
    <>
      <div>JoiningRooms</div>
      {rooms &&
        Object.entries(rooms).map(
          (room: [string, Room], index: number, array: [string, Room][]) => (
            <Link to={`/entered_room/${room[1].room}`} key={index}>
              <div>
                <div>Room: {room[1].room}</div>
                <div>NickName: {room[1].nickName}</div>
                <div>참여인원: {room[1].clients.length}</div>
              </div>
            </Link>
          )
        )}
    </>
  );
};
export default JoiningRooms;
