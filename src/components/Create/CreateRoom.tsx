import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

interface FormValue {
  roomName: string;
  nickName: string;
}

const CreateRoom: React.FC<Props> = ({ socket }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValue>();

  const onSubmitHandler: SubmitHandler<FormValue> = (data) => {
    console.log(data);
    socket.emit("enter_room", data.roomName, data.nickName, socket.id);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <label htmlFor="roomName">RoomName</label>
      <input
        type="text"
        placeholder="write a RoomName"
        {...register("roomName")}
      />
      <label htmlFor="nickName">NickName</label>
      <input
        type="text"
        placeholder="write a RoomName"
        {...register("nickName")}
      />
      <button type="submit">Create</button>
    </form>
  );
};
export default CreateRoom;
