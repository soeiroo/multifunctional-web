import { redirect } from "next/navigation";

export default function NewRoomPage() {
  // Generate random room ID and redirect
  const roomId = Math.random().toString(36).substring(2, 10);
  redirect(`/room/${roomId}`);
}
