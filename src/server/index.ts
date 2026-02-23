import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./types";

const app = express();
const server = createServer(app);
const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, { "pingInterval": 2000, "pingTimeout": 10000 });
const SERVER_PORT = 3001;

// Diretórios
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const __distDirName = path.join(__dirname, '../../dist');
const __distDataName = path.join(__dirname, '../../data');
const __distNodeName = path.join(__dirname, '../../node_modules');

// Rotas
app.use('/dist', express.static(__distDirName));
app.use('/data', express.static(__distDataName));
app.use('/node_modules', express.static(__distNodeName));
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Usuário conectado")
    socket.data.name = socket.id; // Debbug
    socket.emit("userData", socket.data);

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado");
    })
});

try{
  server.listen(SERVER_PORT, () => {
    console.clear();
    console.log(`Servidor rodando em http://localhost:${SERVER_PORT}`);
  });
} catch (error) {
  console.error("Erro ao iniciar o servidor:", error);
}