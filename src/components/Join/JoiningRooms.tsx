import React from "react";
import { Link } from "react-router-dom";

interface Client {
  id: string;
  nickName: string;
}

interface Room {
  room: string;
  nickName: string;
  clients: Client[];
}

interface Props {
  rooms: Room[] | null;
}

const JoiningRooms: React.FC<Props> = ({ rooms }) => {
  return (
    <div className="w-full h-2/3 p-2 flex flex-col items-center">
      <div className="font-bold text-xl mb-4">현재 참여중인 방</div>
      <div className="overflow-y-scroll">
        {rooms &&
          Object.entries(rooms).map(
            (room: [string, Room], index: number, array: [string, Room][]) => (
              <Link to={`/entered_room/${room[1].room}`} key={index}>
                <div className="border w-60 mt-2 px-4 py-2">
                  <div>Room: {room[1].room}</div>
                  <div>NickName: {room[1].nickName}</div>
                  <div>Participants: {room[1].clients.length}</div>
                </div>
              </Link>
            )
          )}
      </div>
    </div>
  );
};
export default JoiningRooms;
