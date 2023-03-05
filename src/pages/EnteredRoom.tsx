import FaceConnection from "@Room/FaceConnection";
import Message from "@Room/Message";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "src/types/socket";

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

interface FormValue {
  message: string;
}

const EnteredRoom: React.FC<Props> = ({ socket }) => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [nickName, setNickName] = useState<string | null>(null);
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const [count, setCount] = useState<number>(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValue>();

  window.onpopstate = (event: PopStateEvent) => {
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  };

  function handleGoBack() {
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  }

  function handleLeave() {
    roomName && socket.emit("leave_room", roomName, socket.id);
    sessionStorage.setItem("renewal", "true");
    navigate("/");
  }

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

  socket.on("message", (nickName: string, message: string) => {
    setCount(count + 1);
    setMessages([
      ...messages,
      <Message
        type="peer"
        nickName={nickName}
        message={message}
        key={`${nickName}-${count}`}
      />,
    ]);
  });

  useEffect(() => {
    roomName && socket.emit("entered", roomName, socket.id);
    socket.on("entered", (nickName) => setNickName(nickName));
  }, []);

  return (
    <>
      <div className="header">
        <button onClick={handleGoBack}>뒤로가기</button>
        <div>{roomName}</div>
        <button onClick={handleLeave}>나가기</button>
      </div>
      <div className="messanger">
        <div className="face-talk">
          {socket && <FaceConnection socket={socket} />}
        </div>
        <div className="message-talk">
          <div className="messages">{messages}</div>
          <form
            className="message-form"
            onSubmit={handleSubmit(onSubmitHandler)}>
            <input
              type="text"
              placeholder="매세지를 작성해주세요..."
              {...register("message")}
              required
            />
            <button type="submit">전송하기</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EnteredRoom;
