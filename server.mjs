import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── Room state ──
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      players: new Map(),
      video: { url: null, playing: false, played: 0, timestamp: Date.now() },
      chat: [],
    });
  }
  return rooms.get(roomId);
}

// Character colors for different players
const COLORS = ["#e8e8e8", "#ff6b6b", "#4ecdc4", "#ffe66d", "#a8e6cf", "#ff8b94", "#7ec8e3", "#c3aed6"];

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Next.js custom server explicitly requires the shape of the deprecated `url.parse(req.url, true)`
    // So we use the new URL API to avoid the CVE warning, but reconstruct the object shape for Next.js
    const parsedUrl = new URL(req.url, `http://${req.headers.host || hostname}`);
    const { pathname } = parsedUrl;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());
    
    handle(req, res, { ...parsedUrl, pathname, query });
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    let currentRoom = null;
    let playerName = `Jogador ${Math.floor(Math.random() * 999)}`;

    // ── Join room ──
    socket.on("room:join", ({ roomId, name, modelUrl }) => {
      if (name) playerName = name;
      currentRoom = roomId;
      socket.join(roomId);

      const room = getRoom(roomId);
      const colorIndex = room.players.size % COLORS.length;
      const playerData = {
        id: socket.id,
        name: playerName,
        color: COLORS[colorIndex],
        modelUrl: modelUrl || "/models/bmo.glb",
        position: { x: 0, y: 2, z: 0 },
        rotation: 0,
      };
      room.players.set(socket.id, playerData);

      // Send current state to joining player
      socket.emit("room:state", {
        players: Array.from(room.players.values()),
        video: room.video,
        chat: room.chat.slice(-50),
        you: socket.id,
      });

      // Notify others
      socket.to(roomId).emit("player:joined", playerData);

      // System chat
      const sysMsg = { type: "system", text: `${playerName} entrou na sala`, timestamp: Date.now() };
      room.chat.push(sysMsg);
      io.to(roomId).emit("chat:message", sysMsg);
    });

    // ── Player movement ──
    socket.on("player:move", ({ position, rotation }) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      const player = room.players.get(socket.id);
      if (player) {
        player.position = position;
        player.rotation = rotation;
        socket.to(currentRoom).emit("player:moved", {
          id: socket.id,
          position,
          rotation,
        });
      }
    });

    // ── Video sync ──
    socket.on("video:url", ({ url }) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      room.video.url = url;
      room.video.playing = true;
      room.video.played = 0;
      room.video.timestamp = Date.now();
      socket.to(currentRoom).emit("video:url", { url });

      const sysMsg = { type: "system", text: `${playerName} adicionou um vídeo`, timestamp: Date.now() };
      room.chat.push(sysMsg);
      io.to(currentRoom).emit("chat:message", sysMsg);
    });

    socket.on("video:play", () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      room.video.playing = true;
      socket.to(currentRoom).emit("video:play");
    });

    socket.on("video:pause", () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      room.video.playing = false;
      socket.to(currentRoom).emit("video:pause");
    });

    socket.on("video:seek", ({ played }) => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      room.video.played = played;
      room.video.timestamp = Date.now();
      socket.to(currentRoom).emit("video:seek", { played });
    });

    // ── Chat ──
    socket.on("chat:send", ({ text }) => {
      if (!currentRoom || !text.trim()) return;
      const room = getRoom(currentRoom);
      const msg = { type: "user", name: playerName, text: text.trim(), timestamp: Date.now() };
      room.chat.push(msg);
      if (room.chat.length > 100) room.chat = room.chat.slice(-100);
      io.to(currentRoom).emit("chat:message", msg);
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      room.players.delete(socket.id);

      socket.to(currentRoom).emit("player:left", { id: socket.id });

      const sysMsg = { type: "system", text: `${playerName} saiu da sala`, timestamp: Date.now() };
      room.chat.push(sysMsg);
      io.to(currentRoom).emit("chat:message", sysMsg);

      // Clean up empty rooms
      if (room.players.size === 0) {
        rooms.delete(currentRoom);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running`);
  });
});
