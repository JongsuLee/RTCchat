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
    <form className="message-form" onSubmit={handleSubmit(onSubmitHandler)}>
      <input
        type="text"
        placeholder="매세지를 작성해주세요..."
        {...register("message")}
        required
      />
      <button type="submit">전송하기</button>
    </form>
  );
};

export default MessageForm;
