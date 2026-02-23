import { clientMessageType, serverMessageType, SocketData } from "../server/types.js";
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

socket.on("chatMessage", ({userId, name, color, content}: clientMessageType) => {

    const item = document.createElement("li");

    if(userId !== socket.data.id) {
        const userTag = document.createElement('span');
        userTag.style = `color: ${color}`;
        userTag.innerText = `${name}: `;
        item.append(userTag);
    } else {
        item.classList.add('self');
    }

    item.append(content);
    messages.append(item);

    window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth"
    });
});

// Metodos do cliente
export function sendMessage(content: string) {
    const msg = {
        userId: socket.data.id,
        content: content
    } as serverMessageType
    socket.emit("chatMessage", msg);
}