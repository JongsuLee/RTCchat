import React from "react";

interface Props {
  type: string;
  message: string;
  nickName: string | null;
}

const Message: React.FC<Props> = ({ type, message, nickName }) => {
  return type === "my" ? (
    <div className="my-message w-60 ml-20 break-words border rounded-xl p-2 my-2">
      <strong>나: </strong>
      {message}
    </div>
  ) : (
    <div className="peer-message w-60 break-words border rounded-xl p-2 my-2">
      <strong>{`${nickName}: `}</strong>
      {message}
    </div>
  );
};

export default Message;
