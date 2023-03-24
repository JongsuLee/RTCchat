import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  selectRoom: string | null;
}

interface FormValue {
  roomName: string;
  nickName: string;
}

const CreateRoom: React.FC<Props> = ({ socket, selectRoom }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValue>();
  const navigate = useNavigate();

  const onSubmitHandler: SubmitHandler<FormValue> = (data) => {
    socket.emit("enter_room", data.roomName, data.nickName, socket.id);
    navigate(`entered_room/${data.roomName}`);
  };

  useEffect(() => {
    const roomName = document.getElementsByTagName(
      "input"
    )[0] as HTMLInputElement;
    if (selectRoom) {
      roomName.value = selectRoom;
      setValue("roomName", selectRoom);
    }
  }, [selectRoom]);

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="px-6 py-4 flex flex-col items-center h-40 justify-between">
      <div className="flex justify-between">
        <div className="w-24 mr-4">RoomName</div>
        <input
          type="text"
          placeholder="write a RoomName"
          {...register("roomName")}
        />
      </div>
      <div className="flex justify-between">
        <div className="w-24 mr-4 inline">NickName</div>
        <input
          type="text"
          placeholder="write a NickName"
          {...register("nickName")}
        />
      </div>
      <button type="submit" className="block w-32 h-12 rounded-full border">
        Create
      </button>
    </form>
  );
};
export default CreateRoom;
