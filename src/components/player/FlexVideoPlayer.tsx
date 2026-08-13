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
  RefreshCw,
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
  const [isPipSupported] = useState(() => typeof document !== "undefined" && "pictureInPictureEnabled" in document && Boolean(document.pictureInPictureEnabled));

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const pendingSeekPositionRef = useRef<number | null>(null);

  const activeSource = sources[activeSourceIndex] || null;
  const isEmbed = activeSource ? !activeSource.url.endsWith(".mp4") && !activeSource.url.endsWith(".m3u8") && activeSource.url.includes("http") : true;

  // Auto-hide controls handler
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

  // Load saved playback position on initial mount
  useEffect(() => {
    const savedPos = getPlaybackPosition(contentId);
    if (savedPos > 0) {
      pendingSeekPositionRef.current = savedPos;
    }
  }, [contentId]);

  // Save position on tab close / component unmount
  useEffect(() => {
    const handleSave = () => {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        savePlaybackPosition({
          contentId,
          slug,
          title,
          type,
          positionSeconds: Math.floor(videoRef.current.currentTime),
          durationSeconds: Math.floor(videoRef.current.duration || 0),
          updatedAt: new Date().toISOString(),
        });
      }
    };

    window.addEventListener("beforeunload", handleSave);
    return () => {
      handleSave();
      window.removeEventListener("beforeunload", handleSave);
    };
  }, [contentId, slug, title, type]);

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
    if (videoRef.current && isPipSupported) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {});
      } else {
        await videoRef.current.requestPictureInPicture().catch(() => {});
      }
    }
  }, [isPipSupported]);

  // Server Source Switch with Position Preservation
  const handleServerSwitch = (index: number) => {
    if (videoRef.current && videoRef.current.currentTime > 0) {
      pendingSeekPositionRef.current = videoRef.current.currentTime;
    }
    setHasError(false);
    setIsLoading(true);
    setActiveSourceIndex(index);
    setShowServerMenu(false);
  };

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

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);

      if (pendingSeekPositionRef.current && pendingSeekPositionRef.current < dur) {
        videoRef.current.currentTime = pendingSeekPositionRef.current;
        pendingSeekPositionRef.current = null;
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
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
          preload="metadata"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-surface-raised border border-border/80 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-surface-raised/80 active:scale-95 transition-all min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4 text-red-500" />
              <span>Retry Server</span>
            </button>
            {sources.length > 1 && (
              <button
                onClick={() => handleServerSwitch((activeSourceIndex + 1) % sources.length)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg hover:shadow-red-600/30 active:scale-95 transition-all min-h-[44px]"
              >
                <span>Switch Server</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom Playit Controls Overlay */}
      {!isEmbed && activeSource && (
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Top Bar: Title, Quality Badge & Server Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-md truncate">
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
              {activeSource.quality && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600/80 text-white border border-red-500/40 uppercase">
                  {activeSource.quality}
                </span>
              )}
            </div>

            {sources.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowServerMenu(!showServerMenu)}
                  aria-label="Select Streaming Server"
                  title="Select Streaming Server"
                  className="px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
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
                        onClick={() => handleServerSwitch(idx)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between min-h-[44px] ${
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
          <div className="space-y-2 pb-safe">
            {/* Progress Bar Slider */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              aria-label="Video Seek Bar"
              className="w-full h-1.5 bg-white/20 accent-red-500 rounded-lg cursor-pointer hover:h-2.5 transition-all"
            />

            {/* Controls Buttons Bar */}
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                    title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
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
                    aria-label="Volume Control"
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
                    aria-label="Playback Settings"
                    title="Playback Settings"
                    className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4" />
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 bottom-12 w-36 rounded-xl bg-surface-base border border-border p-2 shadow-2xl z-40 space-y-1">
                      <div className="text-[10px] font-bold text-text-muted uppercase px-2 py-1">Speed</div>
                      {SPEED_OPTIONS.map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium min-h-[44px] flex items-center ${
                            playbackSpeed === spd ? "bg-red-600 text-white font-bold" : "text-text-secondary hover:bg-surface-raised"
                          }`}
                        >
                          {spd}x {spd === 1.0 && "(Normal)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isPipSupported && (
                  <button
                    onClick={togglePiP}
                    aria-label="Picture in Picture"
                    title="Picture in Picture (P)"
                    className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white hidden sm:flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px] min-w-[44px]"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
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

