import React from "react";

interface Props {
  messages: JSX.Element[];
}

const Messages: React.FC<Props> = ({ messages }) => {
  return <div className="messages">{messages}</div>;
};

export default Messages;
