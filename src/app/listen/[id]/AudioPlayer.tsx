"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      audio.currentTime = fraction * duration;
    },
    [duration]
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-ink rounded-2xl p-8 shadow-lg">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play button + info */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-oxide-red hover:opacity-90 transition-opacity flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{
              fontSize: "32px",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
        <div>
          <p className="text-white text-lg font-medium leading-snug">
            {title}
          </p>
          <p className="text-light-slate text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${formatTime(currentTime)} / ${formatTime(duration)}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 bg-blue-slate/30 rounded-full cursor-pointer group"
        onClick={handleSeek}
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-oxide-red rounded-full relative transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
