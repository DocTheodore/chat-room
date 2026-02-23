export interface ServerToClientEvents {
  noArg: () => void;
  chatMessage: (msg: messageType) => void;
  userData: (data: SocketData) => void;
}

export interface ClientToServerEvents {
  chatMessage: (msg: messageType) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
    name: string;
}

export type messageType = {
    name: string;
    text: string;
}