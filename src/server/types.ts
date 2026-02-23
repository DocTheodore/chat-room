export interface ServerToClientEvents {
  noArg: () => void;
  chatMessage: (msg: clientMessageType) => void;
  userData: (data: SocketData) => void;
}

export interface ClientToServerEvents {
  chatMessage: (msg: serverMessageType) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
    id: number;
    name: string;
    color: string;
}

export type clientMessageType = {
    userId: number;
    name: string;
    color: string;
    content: string;
}
export type serverMessageType = {
    userId: number;
    content: string;
}