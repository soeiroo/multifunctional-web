"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { UserSettings } from "@/components/ui/IntroScreen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalSocket: Socket | null = null;

export interface PlayerData {
  id: string;
  name: string;
  color: string;
  modelUrl: string;
  position: { x: number; y: number; z: number };
  rotation: number;
}

export interface ChatMessage {
  type: "system" | "user";
  name?: string;
  text: string;
  timestamp: number;
}

export interface RoomState {
  players: PlayerData[];
  video: { url: string | null; playing: boolean; played: number; timestamp: number };
  chat: ChatMessage[];
  you: string;
}

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io({ autoConnect: false });
  }
  return globalSocket;
}

export function useSocket(roomId: string | null, settings: UserSettings | null = null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [videoState, setVideoState] = useState<RoomState["video"]>({
    url: null, playing: false, played: 0, timestamp: Date.now(),
  });

  // Video event callbacks (set by VideoPlayer)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoCallbacks = useRef<any>({});

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("room:join", { 
        roomId,
        name: settings?.name || "Jardineiro",
        modelUrl: settings?.modelUrl || "/models/bmo.glb"
      });
    });

    socket.on("room:state", (state: RoomState) => {
      setMyId(state.you);
      setPlayers(state.players.filter((p) => p.id !== state.you));
      setVideoState(state.video);
      setChatMessages(state.chat);
    });

    socket.on("player:joined", (player: PlayerData) => {
      setPlayers((prev) => [...prev.filter((p) => p.id !== player.id), player]);
    });

    socket.on("player:left", ({ id }: { id: string }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    });

    socket.on("player:moved", ({ id, position, rotation }: { id: string; position: { x: number; y: number; z: number }; rotation: number }) => {
      setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, position, rotation } : p));
    });

    // Video events
    socket.on("video:url", ({ url }: { url: string }) => {
      setVideoState((v) => ({ ...v, url, playing: true, played: 0 }));
      videoCallbacks.current.onUrl?.(url);
    });
    socket.on("video:play", () => {
      setVideoState((v) => ({ ...v, playing: true }));
      videoCallbacks.current.onPlay?.();
    });
    socket.on("video:pause", () => {
      setVideoState((v) => ({ ...v, playing: false }));
      videoCallbacks.current.onPause?.();
    });
    socket.on("video:seek", ({ played }: { played: number }) => {
      setVideoState((v) => ({ ...v, played }));
      videoCallbacks.current.onSeek?.(played);
    });

    // Chat
    socket.on("chat:message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-99), msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("room:state");
      socket.off("player:joined");
      socket.off("player:left");
      socket.off("player:moved");
      socket.off("video:url");
      socket.off("video:play");
      socket.off("video:pause");
      socket.off("video:seek");
      socket.off("chat:message");
      socket.disconnect();
      globalSocket = null;
    };
  }, [roomId]);

  const emitMove = useCallback((position: { x: number; y: number; z: number }, rotation: number) => {
    socketRef.current?.emit("player:move", { position, rotation });
  }, []);

  const emitVideoUrl = useCallback((url: string) => {
    socketRef.current?.emit("video:url", { url });
  }, []);

  const emitVideoPlay = useCallback(() => {
    socketRef.current?.emit("video:play");
  }, []);

  const emitVideoPause = useCallback(() => {
    socketRef.current?.emit("video:pause");
  }, []);

  const emitVideoSeek = useCallback((played: number) => {
    socketRef.current?.emit("video:seek", { played });
  }, []);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit("chat:send", { text });
  }, []);

  return {
    connected,
    myId,
    players,
    chatMessages,
    videoState,
    videoCallbacks,
    emitMove,
    emitVideoUrl,
    emitVideoPlay,
    emitVideoPause,
    emitVideoSeek,
    sendChat,
  };
}
