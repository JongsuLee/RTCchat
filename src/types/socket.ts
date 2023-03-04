export interface ServerToClientEvents {
  new_come: (data: string) => void;
  renewal: (joiningRooms: string, openRooms: string) => void;
  join: (data: string) => void;
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  new_come: (id: string) => void;
  come_back: (prevId: string, id: string) => void;
  enter_room: (roonName: string, nickName: string, id: string) => void;
  renewal: (id: string) => void;
  hi: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
