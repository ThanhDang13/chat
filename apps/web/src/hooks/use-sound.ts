import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Hook to play a sound.
 * @param src URL of the audio file (e.g., "/sounds/ding.mp3")
 */
export function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const [canPlay, setCanPlay] = useState(false);

  // Detect first user interaction
  useEffect(() => {
    const enableSound = () => setCanPlay(true);
    window.addEventListener("click", enableSound, { once: true });
    window.addEventListener("keydown", enableSound, { once: true });

    return () => {
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };
  }, []);

  const play = useCallback(() => {
    if (!canPlay) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => console.warn("Sound play failed", err));
  }, [canPlay]);

  return { play, canPlay };
}
