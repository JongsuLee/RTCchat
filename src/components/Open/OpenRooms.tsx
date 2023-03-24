import React, { ChangeEvent, SetStateAction } from "react";

interface Client {
  id: string;
  nickName: string;
}

interface Room {
  room: string;
  host: string;
  clients: Client[];
}

interface Props {
  rooms: Room[] | null;
  setSelectRoom: React.Dispatch<SetStateAction<string | null>>;
}

const OpenRooms: React.FC<Props> = ({ rooms, setSelectRoom }) => {
  function selectRoom(event: React.MouseEvent<HTMLDivElement>) {
    setSelectRoom((event.target as any).id);
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="font-bold text-xl my-4">현재 운영중인 방</div>
      <div className="flex flex-wrap overflow-y-scroll scroll-ml-4">
        {rooms &&
          Object.entries(rooms).map((room, index) => (
            <div
              key={index}
              className={`border w-52 mt-2 px-4 py-2 mx-4`}
              id={room[1].room}
              onClick={selectRoom}>
              <div id={`${room[1].room}`}>Room: {room[1].room}</div>
              <div id={`${room[1].room}`}>
                Host:{" "}
                {
                  room[1].clients.filter(
                    (client) => client.id === room[1].host
                  )[0].nickName
                }
              </div>
              <div id={`${room[1].room}`}>
                Participants: {room[1].clients.length}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OpenRooms;
