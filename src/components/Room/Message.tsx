import React from "react";

interface Props {
  type: string;
  message: string;
  nickName: string | null;
}

const Message: React.FC<Props> = ({ type, message, nickName }) => {
  return type === "my" ? (
    <div className="my-message">{`나: ${message}`}</div>
  ) : (
    <div className="peer-message">{`${nickName}: ${message}`}</div>
  );
};

export default Message;
