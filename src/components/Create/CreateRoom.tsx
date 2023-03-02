import React from "react";

const CreateRoom: React.FC = () => {
  return (
    <form>
      <label htmlFor="roomName">RoomName</label>
      <input type="text" placeholder="write a RoomName" name="roomName" />
      <label htmlFor="nickName">NickName</label>
      <input type="text" placeholder="write a RoomName" name="nickName" />
      <button>Create</button>
    </form>
  );
};
export default CreateRoom;
