import { createFileRoute } from "@tanstack/react-router";
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
  useParticipants
} from "@livekit/components-react";
import "@livekit/components-styles"; // LiveKit default styles
import { Track } from "livekit-client";
import { useAuthStore } from "@web/stores/auth-store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/call")({
  component: CallPage
});

function CallPage() {
  const { me } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const res = await fetch(`/api/livekit-token?identity=${me?.id}`);
      const { token } = await res.json();
      setToken(token);
    };
    getToken();
  }, [me]);

  if (!token) {
    return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880"}
      token={token}
      connect
      video
      audio
      className="flex h-screen w-screen flex-col bg-gray-900 text-white"
    >
      {/* Now useTracks is inside the room context */}
      <LiveKitGrid />
      {/* <VideoConference></VideoConference> */}

      {/* <div className="p-4 bg-black/60 backdrop-blur flex justify-center rounded-t-xl">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            leave: true
          }}
        />
      </div> */}
    </LiveKitRoom>
  );
}

function LiveKitGrid() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);

  // GridLayout handles all track rendering internally
  return (
    <GridLayout tracks={tracks}>
      <ParticipantTile />
    </GridLayout>
  );
}
