import React from "react";

interface Props {
  messages: JSX.Element[];
}

const Messages: React.FC<Props> = ({ messages }) => {
  return (
    <div className="messages w-96 h-4/5 overflow-y-scroll px-4 mb-10">
      {messages}
    </div>
  );
};

export default Messages;
