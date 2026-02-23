import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { clientMessageType, ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./types";
import Database from 'better-sqlite3';

const db = new Database('chat.db');
db.pragma('journal_mode = WAL');

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(25) UNIQUE,
      color VARCHAR(7)
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);


const __insert_user = db.prepare(`INSERT INTO users (name, color) VALUES (?, ?)`);
const __getLast_user = db.prepare(`SELECT * FROM users ORDER BY id DESC LIMIT 1;`);

const __insert_chat = db.prepare(`INSERT INTO messages (user_id, content) VALUES (?, ?)`);
const __getAll_chat = db.prepare(`    
    SELECT usr.id AS userId, usr.name, usr.color, msg.content 
    FROM messages msg 
    INNER JOIN users usr ON usr.id = msg.user_id 
    ORDER BY msg.id ASC
`);
const __getLast_chat = db.prepare(`
    SELECT usr.id AS userId, usr.name, usr.color, msg.content 
    FROM messages msg 
    INNER JOIN users usr ON usr.id = msg.user_id 
    ORDER BY msg.id DESC
    LIMIT 1;
`);

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

function randomHex() {
  const randomInt = Math.floor(Math.random() * 256); // Range 0-255
  let hexString = randomInt.toString(16);
  if (hexString.length < 2) {
    hexString = '0' + hexString;
  }
  return hexString.toUpperCase();
}

io.on("connection", async (socket) => {
    console.log("Usuário conectado")
    socket.data.name = socket.id; // Debbug

    let userResult;
    let prevChat: clientMessageType[] = [];
    const color = `#${randomHex()}${randomHex()}${randomHex()}`;

    try {
        await __insert_user.run(socket.data.name, color);
        userResult = await __getLast_user.all()[0];
        prevChat = await __getAll_chat.all() as clientMessageType[];
    } catch (e) {
        console.error('Um erro aconteceu no banco:', e);
        socket.disconnect();
    } finally {
        socket.emit("userData", userResult as SocketData);
        if(prevChat.length > 0) {
            prevChat.forEach((msg) => {
                //console.log(msg);
                socket.emit("chatMessage", msg);
            });
        }
    }

    socket.on("chatMessage", async (msg) => {
        let result

        try{
            await __insert_chat.run(msg.userId, msg.content);
            result = await __getLast_chat.all()[0];
        } catch(e) {
            console.error('Um erro aconteceu no banco:', e);
        } finally {
            //console.log(result);
            io.emit("chatMessage", result as clientMessageType);
        }
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