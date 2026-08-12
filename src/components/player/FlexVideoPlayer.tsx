"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  RotateCw,
  Server,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { PlaybackSourceItem } from "@/lib/content/public-catalog";
import { savePlaybackPosition, getPlaybackPosition } from "@/features/user/lib/playback-tracker";
import { SmartAdGateModal } from "@/components/player/SmartAdGateModal";
import { canTriggerAdGate, recordAdGateShown } from "@/lib/ads/ad-gate";
import { AdCreative } from "@/lib/ads/ad-engine";

interface FlexVideoPlayerProps {
  title: string;
  contentId: string;
  slug: string;
  type?: "movie" | "series";
  posterUrl?: string;
  sources: PlaybackSourceItem[];
  onEpisodeEnded?: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function FlexVideoPlayer({
  title,
  contentId,
  slug,
  type = "movie",
  posterUrl,
  sources,
  onEpisodeEnded,
}: FlexVideoPlayerProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doubleTapAnimation, setDoubleTapAnimation] = useState<"forward" | "backward" | null>(null);
  const [showAdGate, setShowAdGate] = useState(false);
  const [gateCreative, setGateCreative] = useState<AdCreative | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  const activeSource = sources[activeSourceIndex] || null;
  const isEmbed = activeSource ? !activeSource.url.endsWith(".mp4") && !activeSource.url.endsWith(".m3u8") && activeSource.url.includes("http") : true;

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
        setShowServerMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Load saved playback position
  useEffect(() => {
    const savedPos = getPlaybackPosition(contentId);
    if (savedPos > 0 && videoRef.current) {
      videoRef.current.currentTime = savedPos;
    }
  }, [contentId]);

  // Action Handlers
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setHasError(true));
      }
      setIsPlaying((prev) => !prev);
    }
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const seekBy = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const changeVolume = useCallback((delta: number) => {
    if (videoRef.current) {
      const newVol = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVol;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
    resetControlsTimeout();
  }, [volume, resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    resetControlsTimeout();
  }, [isMuted, resetControlsTimeout]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {});
      } else {
        await videoRef.current.requestPictureInPicture().catch(() => {});
      }
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "p":
          e.preventDefault();
          togglePiP();
          break;
        case "arrowleft":
          e.preventDefault();
          seekBy(-5);
          break;
        case "arrowright":
          e.preventDefault();
          seekBy(5);
          break;
        case "arrowup":
          e.preventDefault();
          changeVolume(0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          changeVolume(-0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, togglePiP, seekBy, changeVolume]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(curr);
      setDuration(dur);

      // Check Smart Ad Gate Trigger
      if (!showAdGate && canTriggerAdGate(contentId, Math.floor(curr))) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowAdGate(true);
        recordAdGateShown(contentId);

        // Fetch ad creative
        fetch(`/api/ads/track?placement=player_mid_roll`)
          .then((r) => r.json())
          .then((d) => setGateCreative(d.creative))
          .catch(() => {});
      }

      // Save position every 5s
      if (Math.floor(curr) % 5 === 0 && curr > 0) {
        savePlaybackPosition({
          contentId,
          slug,
          title,
          type,
          positionSeconds: Math.floor(curr),
          durationSeconds: Math.floor(dur),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSettings(false);
  };

  // Double Tap Seek for Mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const touchX = e.changedTouches[0].clientX;
    const rect = containerRef.current?.getBoundingClientRect();

    if (rect && now - lastTapRef.current.time < 300) {
      const midX = rect.left + rect.width / 2;
      if (touchX > midX) {
        seekBy(10);
        setDoubleTapAnimation("forward");
      } else {
        seekBy(-10);
        setDoubleTapAnimation("backward");
      }
      setTimeout(() => setDoubleTapAnimation(null), 600);
    }
    lastTapRef.current = { time: now, x: touchX };
    resetControlsTimeout();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-border shadow-2xl group select-none"
    >
      {/* Video Element or Embed Iframe */}
      {activeSource?.url && !isEmbed ? (
        <video
          ref={videoRef}
          src={activeSource.url}
          poster={posterUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onEnded={() => {
            setIsPlaying(false);
            onEpisodeEnded?.();
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />
      ) : activeSource?.url ? (
        <iframe
          src={activeSource.url}
          title={title}
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-surface-base">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <h3 className="text-base font-bold text-text-primary">No Streaming Server Available</h3>
          <p className="text-xs text-text-muted max-w-sm">
            Streaming servers for this content will be configured by admin. Please check back shortly.
          </p>
        </div>
      )}

      {/* Double Tap Animation Overlay */}
      {doubleTapAnimation && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-30 p-6 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-sm flex items-center gap-1 animate-ping ${doubleTapAnimation === "forward" ? "right-12" : "left-12"}`}>
          {doubleTapAnimation === "forward" ? <RotateCw className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
          {doubleTapAnimation === "forward" ? "+10s" : "-10s"}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && activeSource?.url && !hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
        </div>
      )}

      {/* Error Fallback Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div>
            <h4 className="text-base font-bold text-white">Playback Error</h4>
            <p className="text-xs text-text-muted">The current streaming server could not be loaded.</p>
          </div>
          {sources.length > 1 && (
            <button
              onClick={() => {
                setHasError(false);
                setActiveSourceIndex((prev) => (prev + 1) % sources.length);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-700 transition-colors"
            >
              Switch to Next Server
            </button>
          )}
        </div>
      )}

      {/* Custom Playit Controls Overlay */}
      {!isEmbed && activeSource && (
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Top Bar: Title & Server Selection */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white truncate max-w-md">{title}</h3>
            {sources.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowServerMenu(!showServerMenu)}
                  className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  <Server className="h-3.5 w-3.5 text-red-400" />
                  <span>{activeSource.source_name}</span>
                </button>

                {showServerMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-base border border-border shadow-2xl p-2 space-y-1 z-40">
                    <div className="text-[10px] font-bold text-text-muted uppercase px-2 py-1">Select Server</div>
                    {sources.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSourceIndex(idx);
                          setShowServerMenu(false);
                          setHasError(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                          idx === activeSourceIndex ? "bg-red-600 text-white font-bold" : "text-text-secondary hover:bg-surface-raised"
                        }`}
                      >
                        <span>{s.source_name}</span>
                        <span className="text-[10px] opacity-75">{s.quality}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar Controls */}
          <div className="space-y-2">
            {/* Progress Bar Slider */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1.5 bg-white/20 accent-red-500 rounded-lg cursor-pointer hover:h-2.5 transition-all"
            />

            {/* Controls Buttons Bar */}
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVolume(v);
                      if (videoRef.current) videoRef.current.volume = v;
                    }}
                    className="w-16 h-1 bg-white/20 accent-white rounded cursor-pointer hidden sm:block"
                  />
                </div>

                <span className="text-[11px] font-mono text-white/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed Settings Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 bottom-10 w-36 rounded-xl bg-surface-base border border-border p-2 shadow-2xl z-40 space-y-1">
                      <div className="text-[10px] font-bold text-text-muted uppercase px-2 py-1">Speed</div>
                      {SPEED_OPTIONS.map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                            playbackSpeed === spd ? "bg-red-600 text-white font-bold" : "text-text-secondary hover:bg-surface-raised"
                          }`}
                        >
                          {spd}x {spd === 1.0 && "(Normal)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={togglePiP} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white hidden sm:block">
                  <PictureInPicture className="h-4 w-4" />
                </button>

                <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Ad Gate Modal */}
      {showAdGate && (
        <SmartAdGateModal
          creative={gateCreative}
          onUnlock={() => {
            setShowAdGate(false);
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }}
        />
      )}
    </div>
  );
}
