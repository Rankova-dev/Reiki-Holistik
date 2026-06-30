import { useRef, useState, useCallback, useEffect } from "react";

interface VideoLessonProps {
  lessonId: string;
  src: string;
  completed: boolean;
  onComplete: () => void;
}

const VideoLesson = ({ lessonId, src, completed, onComplete }: VideoLessonProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const maxReachedRef = useRef(0);

  // Block seeking forward past what the user has actually watched
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxReachedRef.current) {
      maxReachedRef.current = video.currentTime;
    }
  }, []);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // Once the lesson is completed, allow free seeking (rewatch freely)
    if (completed) return;
    // Otherwise allow seeking backwards freely, but not forward past maxReached
    if (video.currentTime > maxReachedRef.current + 1) {
      video.currentTime = maxReachedRef.current;
    }
  }, [completed]);

  const handleEnded = useCallback(() => {
    setHasEnded(true);
    if (!completed) {
      onComplete();
    }
  }, [completed, onComplete]);

  // Reset state when lesson changes
  useEffect(() => {
    setHasEnded(false);
    maxReachedRef.current = 0;
  }, [lessonId]);

  return (
    <div className="mt-4">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full rounded-lg bg-black"
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onEnded={handleEnded}
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta la reproducción de vídeo.
      </video>

      {!completed && (
        <button
          disabled={!hasEnded}
          onClick={onComplete}
          className={`mt-3 px-5 py-2 rounded-full font-body text-xs font-medium transition-opacity ${
            hasEnded
              ? "bg-earth-deep text-cream hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {hasEnded ? "Marcar como completado" : "Mira el vídeo completo para continuar"}
        </button>
      )}
    </div>
  );
};

export default VideoLesson;
