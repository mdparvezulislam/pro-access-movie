"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  AlertTriangle,
  Radio,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaybackSource } from "@/lib/playback/sources";
import { useFlexPlayer } from "./use-flex-player";
import { SourceSelectorModal } from "./source-selector-modal";

export interface FlexPlayerProps {
  title: string;
  sources: PlaybackSource[];
  initialPosition?: number;
  autoPlay?: boolean;
  onBack?: () => void;
  onPositionUpdate?: (progressSeconds: number, durationSeconds: number) => void;
  onEnded?: () => void;
}

export function FlexPlayer({
  title,
  sources,
  initialPosition = 0,
  autoPlay = false,
  onBack,
  onPositionUpdate,
  onEnded,
}: FlexPlayerProps) {
  const {
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
  } = useFlexPlayer({
    sources,
    initialPosition,
    autoPlay,
    onPositionUpdate,
    onEnded,
  });

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
        case "KeyJ":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "ArrowRight":
        case "KeyL":
          e.preventDefault();
          seekRelative(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, seekRelative, changeVolume, volume]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className="relative w-full aspect-video bg-black overflow-hidden select-none group rounded-2xl border border-border shadow-2xl"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={activeSource?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={onEnded}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Double Tap Seek Feedback Overlay */}
      {doubleTapFeedback && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-6 py-3 rounded-2xl bg-black/80 text-white font-extrabold text-lg border border-red-500/50 shadow-xl animate-ping">
            {doubleTapFeedback}
          </div>
        </div>
      )}

      {/* Loading Spinner Overlay */}
      {isLoading && !errorMessage && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-10 w-10 text-red-500 animate-spin" />
            <span className="text-xs text-white font-medium">Connecting to stream mirror...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {errorMessage && (
        <div className="absolute inset-0 bg-surface-base/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-bold text-white">Playback Error</h3>
          <p className="text-xs text-text-secondary max-w-md">{errorMessage}</p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="cinematic"
              size="sm"
              onClick={() => selectSourceManually((activeSourceIndex + 1) % sources.length)}
            >
              Switch Mirror
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSourceModalOpen(true)}>
              View All Mirrors
            </Button>
          </div>
        </div>
      )}

      {/* Player Header Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">{title}</h2>
            <span className="text-[10px] text-red-400 font-semibold">{activeSource?.label}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSourceModalOpen(true)}
          className="gap-1.5 text-xs bg-black/50 border-white/20 text-white hover:bg-white/20"
        >
          <Radio className="h-3.5 w-3.5 text-red-500" />
          <span>Mirrors</span>
        </Button>
      </div>

      {/* Player Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-opacity duration-300 space-y-2 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Slider */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white text-xs pt-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => seekRelative(-10)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => seekRelative(10)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2 group/vol">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 text-white/80 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/30 rounded accent-red-600 cursor-pointer"
              />
            </div>

            <span className="text-[11px] text-white/80 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="h-8 text-xs text-white/80 hover:text-white"
              >
                <Sliders className="h-3.5 w-3.5 mr-1" />
                <span>{playbackSpeed}x</span>
              </Button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 bg-card border border-border rounded-xl p-1 shadow-xl space-y-0.5 text-xs text-text-primary z-50">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        changeSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-raised transition-colors ${
                        playbackSpeed === s ? "font-bold text-red-500" : ""
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 text-white/80 hover:text-white rounded-full"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Source Selector Modal */}
      <SourceSelectorModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        sources={sources}
        activeSourceId={activeSource?.id}
        onSelectSource={(s) => {
          const idx = sources.findIndex((item) => item.id === s.id);
          if (idx !== -1) selectSourceManually(idx);
        }}
      />
    </div>
  );
}
