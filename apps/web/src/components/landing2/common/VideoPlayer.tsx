"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  aspectRatio?: string;
  showControls?: boolean;
  loop?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  className = "",
  aspectRatio = "16/9",
  showControls = true,
  loop = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => setHasError(true));
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 ${className}`}
      style={{ aspectRatio }}
    >
      {prefersReducedMotion || hasError ? (
        poster ? (
          <img
            src={poster}
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-navy" />
        )
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop={loop}
          playsInline
          preload="none"
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Poster overlay while not playing */}
      {poster && !isPlaying && !hasError && !prefersReducedMotion && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: isPlaying ? 0 : 1 }}
          loading="lazy"
        />
      )}

      {showControls && !prefersReducedMotion && !hasError && (
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>
      )}
    </div>
  );
}
