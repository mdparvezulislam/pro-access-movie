"use client";

import { useState, useEffect, useRef } from "react";
import { PlaybackSource } from "@/lib/playback/sources";

interface UseFlexPlayerProps {
  sources: PlaybackSource[];
  initialPosition?: number;
  autoPlay?: boolean;
  onPositionUpdate?: (progressSeconds: number, durationSeconds: number) => void;
  onEnded?: () => void;
}

export function useFlexPlayer({
  sources,
  initialPosition = 0,
  autoPlay = false,
  onPositionUpdate,
  onEnded,
}: UseFlexPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const activeSource = sources[activeSourceIndex] || sources[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<"+10s" | "-10s" | null>(null);

  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize initial position & autostart
  useEffect(() => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);
    if (onPositionUpdate && dur > 0) {
      onPositionUpdate(curr, dur);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setErrorMessage(null);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setErrorMessage("Unable to load video stream from current mirror server.");
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(videoRef.current.currentTime);
  };

  const seekRelative = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    seek(videoRef.current.currentTime + deltaSeconds);
    if (deltaSeconds > 0) {
      setDoubleTapFeedback("+10s");
    } else {
      setDoubleTapFeedback("-10s");
    }
    setTimeout(() => setDoubleTapFeedback(null), 800);
  };

  const changeVolume = (newVol: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const selectSourceManually = (index: number) => {
    if (index >= 0 && index < sources.length) {
      setActiveSourceIndex(index);
      setIsLoading(true);
      setErrorMessage(null);
    }
  };

  return {
    videoRef,
    containerRef,
    activeSource,
    activeSourceIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    showControls,
    isLoading,
    errorMessage,
    doubleTapFeedback,
    togglePlay,
    seek,
    seekRelative,
    changeVolume,
    toggleMute,
    changeSpeed,
    toggleFullscreen,
    resetControlsTimer,
    selectSourceManually,
    handleTimeUpdate,
    handleLoadedData,
    handleError,
    onEnded,
  };
}
