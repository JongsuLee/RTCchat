import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";
import Message from "./Message";

interface FormValue {
  message: string;
}

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  roomName: string;
  nickName: string | null;
  messages: JSX.Element[];
  setMessages: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

const MessageForm: React.FC<Props> = ({
  socket,
  roomName,
  nickName,
  messages,
  setMessages,
  count,
  setCount,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValue>();
  const onSubmitHandler: SubmitHandler<FormValue> = (data) => {
    setCount(count + 1);
    setMessages([
      ...messages,
      <Message
        type="my"
        message={data.message}
        nickName={nickName}
        key={`${nickName}-${count}`}
      />,
    ]);
    roomName &&
      nickName &&
      socket.emit("message", roomName, nickName, data.message);
    const input = document.querySelector("input");
    if (input) input.value = "";
  };
  return (
    <form
      className="message-form w-96 h-32 flex justify-between items-center"
      onSubmit={handleSubmit(onSubmitHandler)}>
      <input
        className="w-2/3 h-2/3"
        type="text"
        placeholder="매세지를 작성해주세요..."
        {...register("message")}
        required
      />
      <button
        className="w-24 h-12 font-bold border rounded-lg p-2 bg-sky-300 hover:bg-sky-600 hover:text-white"
        type="submit">
        전송하기
      </button>
    </form>
  );
};

export default MessageForm;
