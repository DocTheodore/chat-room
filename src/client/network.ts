import { messageType, SocketData } from "../server/types.js";
import { messages } from "./main.js";

declare const io:any;
export const socket = io();

// Metodos do servidor
socket.on("connect", () => {
    console.log("Conectado com o servidor");
});

socket.on("userData", (data: SocketData) => {
    socket.data = data;
    console.log("Informações carregadas", socket.data);
});

socket.on("chatMessage", ({name, text}: messageType) => {
    const item = document.createElement("li");
    item.textContent = `${name}: ${text}`;
    messages.append(item);
    window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth"
    });
});

// Metodos do cliente
export function sendMessage(text: string) {
    const msg = {
        name: socket.data.name,
        text: text
    }
    socket.emit("chatMessage", msg);
}