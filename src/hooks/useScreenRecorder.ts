import { useState, useRef, useCallback, useEffect } from 'react';
import { toast as showToast } from "@/hooks/use-toast";

export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export interface UseScreenRecorderReturn {
  state: RecordingState;
  isRecording: boolean;
  duration: number;
  error: string | null;
  screenStream: MediaStream | null;
  webcamStream: MediaStream | null;
  isVoiceEnabled: boolean;
  isFaceVideoEnabled: boolean;
  isPreviewing: boolean;
  hasRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: () => void;
  startPreview: () => Promise<void>;
  stopPreview: () => void;
  toggleVoice: () => void;
  toggleFaceVideo: () => void;
}

export const useScreenRecorder = (): UseScreenRecorderReturn => {
  const [state, setState] = useState<RecordingState>('idle');
  const stateRef = useRef<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isFaceVideoEnabled, setIsFaceVideoEnabled] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeRafRef = useRef<number | null>(null);
  const screenVideoElRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoElRef = useRef<HTMLVideoElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopAllStreams = () => {
    if (compositeRafRef.current) {
      cancelAnimationFrame(compositeRafRef.current);
      compositeRafRef.current = null;
    }
    canvasStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    webcamStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());

    if (screenVideoElRef.current) {
      screenVideoElRef.current.pause();
      screenVideoElRef.current.srcObject = null;
      screenVideoElRef.current.remove();
      screenVideoElRef.current = null;
    }

    if (webcamVideoElRef.current) {
      webcamVideoElRef.current.pause();
      webcamVideoElRef.current.srcObject = null;
      webcamVideoElRef.current.remove();
      webcamVideoElRef.current = null;
    }

    compositeCanvasRef.current = null;
    canvasStreamRef.current = null;

    if (audioContextRef.current) {
      try {
        void audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
      audioDestinationRef.current = null;
    }
    screenStreamRef.current = null;
    webcamStreamRef.current = null;
    micStreamRef.current = null;
    setScreenStream(null);
    setWebcamStream(null);
  };

  const ensureMixedAudioTrack = useCallback(async () => {
    if (!isVoiceEnabled) return null;

    const screenAudioTracks = screenStreamRef.current?.getAudioTracks() ?? [];
    const hasSystemAudio = screenAudioTracks.length > 0;
    const hasMicAudio = !!micStreamRef.current && micStreamRef.current.getAudioTracks().length > 0;

    if (!hasSystemAudio && !hasMicAudio) {
      return null;
    }

    // Some browsers only record the first audio track. Mix into a single track.
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      // Fallback: return the first available track.
      return (screenAudioTracks[0] ?? micStreamRef.current?.getAudioTracks()?.[0] ?? null);
    }

    const audioContext = new AudioContextCtor();
    const destination = audioContext.createMediaStreamDestination();

    audioContextRef.current = audioContext;
    audioDestinationRef.current = destination;

    const connectStreamAudio = (stream: MediaStream, gainValue: number) => {
      const source = audioContext.createMediaStreamSource(stream);
      const gain = audioContext.createGain();
      gain.gain.value = gainValue;
      source.connect(gain);
      gain.connect(destination);
    };

    if (hasSystemAudio && screenStreamRef.current) {
      connectStreamAudio(screenStreamRef.current, 1);
    }

    if (hasMicAudio && micStreamRef.current) {
      connectStreamAudio(micStreamRef.current, 1);
    }

    try {
      await audioContext.resume();
    } catch {
      // ignore
    }

    return destination.stream.getAudioTracks()[0] ?? null;
  }, [isVoiceEnabled]);

  const createHiddenVideoElement = (stream: MediaStream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = 'fixed';
    video.style.left = '-99999px';
    video.style.top = '0';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    return video;
  };

  const waitForVideoReady = async (video: HTMLVideoElement) => {
    if (video.readyState >= 2) {
      try {
        await video.play();
      } catch {
        // ignore
      }
      return;
    }
    await new Promise<void>((resolve) => {
      const onReady = () => {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('loadedmetadata', onReady);
        resolve();
      };
      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('loadedmetadata', onReady, { once: true });
    });
    try {
      await video.play();
    } catch {
      // ignore
    }
  };

  const roundRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  };

  const ensureCompositeStream = useCallback(async () => {
    if (canvasStreamRef.current) return canvasStreamRef.current;
    if (!screenStreamRef.current) return null;

    const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
    if (!screenVideoTrack) return null;

    const settings = screenVideoTrack.getSettings?.() ?? {};
    const width = (typeof settings.width === 'number' && settings.width > 0) ? settings.width : 1280;
    const height = (typeof settings.height === 'number' && settings.height > 0) ? settings.height : 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    compositeCanvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (!screenVideoElRef.current) {
      screenVideoElRef.current = createHiddenVideoElement(screenStreamRef.current);
      await waitForVideoReady(screenVideoElRef.current);
    }

    if (webcamStreamRef.current && !webcamVideoElRef.current) {
      webcamVideoElRef.current = createHiddenVideoElement(webcamStreamRef.current);
      await waitForVideoReady(webcamVideoElRef.current);
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const hslVar = (name: string) => rootStyle.getPropertyValue(name).trim();
    const hsl = (name: string, alpha = 1) => {
      const value = hslVar(name);
      return value ? `hsl(${value} / ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    };
    const borderGradient = (() => {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, hsl('--primary', 0.9));
      grad.addColorStop(1, hsl('--preview', 0.9));
      return grad;
    })();

    const drawFrame = () => {
      const screenVideo = screenVideoElRef.current;
      if (!screenVideo || !compositeCanvasRef.current) return;

      ctx.clearRect(0, 0, width, height);

      // Base: screen
      try {
        ctx.drawImage(screenVideo, 0, 0, width, height);
      } catch {
        // ignore draw errors
      }

      // PiP: webcam (if available)
      const webcamVideo = webcamVideoElRef.current;
      if (webcamVideo && webcamStreamRef.current) {
        const padding = Math.max(12, Math.round(width * 0.02));
        const pipWidth = Math.min(
          260,
          Math.max(140, Math.round(width * 0.18))
        );
        const ratio = (webcamVideo.videoWidth && webcamVideo.videoHeight)
          ? webcamVideo.videoHeight / webcamVideo.videoWidth
          : (240 / 320);
        const pipHeight = Math.min(
          Math.round(height * 0.25),
          Math.max(96, Math.round(pipWidth * ratio))
        );

        const x = width - pipWidth - padding;
        const y = height - pipHeight - padding;
        const radius = Math.round(Math.min(pipWidth, pipHeight) * 0.08);

        // Shadow + subtle backdrop
        ctx.save();
        ctx.beginPath();
        roundRectPath(ctx, x, y, pipWidth, pipHeight, radius);
        ctx.shadowColor = hsl('--background', 0.6);
        ctx.shadowBlur = Math.max(10, Math.round(width * 0.01));
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.max(4, Math.round(width * 0.004));
        ctx.fillStyle = hsl('--background', 0.25);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        roundRectPath(ctx, x, y, pipWidth, pipHeight, radius);
        ctx.clip();

        // Mirror webcam horizontally
        ctx.translate(x + pipWidth, y);
        ctx.scale(-1, 1);
        try {
          ctx.drawImage(webcamVideo, 0, 0, pipWidth, pipHeight);
        } catch {
          // ignore
        }
        ctx.restore();

        // Border
        ctx.save();
        ctx.beginPath();
        roundRectPath(ctx, x, y, pipWidth, pipHeight, radius);
        ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
        ctx.strokeStyle = borderGradient;
        ctx.stroke();
        ctx.restore();
      }

      compositeRafRef.current = requestAnimationFrame(drawFrame);
    };

    compositeRafRef.current = requestAnimationFrame(drawFrame);
    canvasStreamRef.current = canvas.captureStream(30);
    return canvasStreamRef.current;
  }, []);

  const stopPreview = useCallback(() => {
    stopAllStreams();
    setIsPreviewing(false);
    showToast({ title: "Preview stopped" });
  }, []);

  const stopRecording = useCallback(async () => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' ||
        mediaRecorderRef.current.state === 'paused')
    ) {
      mediaRecorderRef.current.stop();
    }
    stopAllStreams();
    setIsPreviewing(false);
    showToast({ title: "Recording stopped" });
  }, []);

  const getScreenStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen recording is not supported in this browser.');
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true,
    });

    // When user clicks "Stop sharing" in browser UI
    stream.getVideoTracks()[0].onended = () => {
      const currentState = stateRef.current;
      if (currentState === 'recording' || currentState === 'paused') {
        void stopRecording();
      } else {
        stopPreview();
      }
    };

    return stream;
  }, [stopPreview, stopRecording]);

  const getWebcamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      return stream;
    } catch (e) {
      console.warn('Webcam unavailable:', e);
      showToast({
        variant: "destructive",
        title: "Webcam unavailable",
        description: "Could not access your camera. Face video will be disabled.",
      });
      return null;
    }
  };

  const getMicStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      return stream;
    } catch (e) {
      console.warn('Microphone unavailable:', e);
      showToast({
        variant: "destructive",
        title: "Microphone unavailable",
        description: "Could not access your microphone. Voice recording will be disabled.",
      });
      return null;
    }
  };

  const startPreview = useCallback(async () => {
    try {
      setError(null);

      const screen = await getScreenStream();
      screenStreamRef.current = screen;
      setScreenStream(screen);

      if (isFaceVideoEnabled) {
        const webcam = await getWebcamStream();
        if (webcam) {
          webcamStreamRef.current = webcam;
          setWebcamStream(webcam);
        }
      }

      if (isVoiceEnabled) {
        const mic = await getMicStream();
        if (mic) micStreamRef.current = mic;
      }

      setIsPreviewing(true);
      showToast({ title: "Preview started" });
    } catch (err) {
      console.error('Preview error:', err);
      const message = err instanceof Error ? err.message : 'Failed to start preview';
      setError(message);
      showToast({ variant: "destructive", title: "Preview failed", description: message });
      stopAllStreams();
    }
  }, [getScreenStream, isFaceVideoEnabled, isVoiceEnabled]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setState('processing');
      recordedChunksRef.current = [];
      setHasRecording(false);

      // Get screen if not previewing
      if (!screenStreamRef.current) {
        const screen = await getScreenStream();
        screenStreamRef.current = screen;
        setScreenStream(screen);
      }

      // Get webcam if enabled and not already active
      if (isFaceVideoEnabled && !webcamStreamRef.current) {
        const webcam = await getWebcamStream();
        if (webcam) {
          webcamStreamRef.current = webcam;
          setWebcamStream(webcam);
        }
      }

      // Get mic if enabled and not already active
      if (isVoiceEnabled && !micStreamRef.current) {
        const mic = await getMicStream();
        if (mic) micStreamRef.current = mic;
      }

      // Build combined stream for recording
      const combinedStream = new MediaStream();

      // Add video (screen only OR screen + face PiP)
      const shouldComposite = isFaceVideoEnabled && !!webcamStreamRef.current;
      if (shouldComposite) {
        const compositeStream = await ensureCompositeStream();
        if (compositeStream) {
          compositeStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
        } else {
          showToast({
            variant: "destructive",
            title: "Face video recording disabled",
            description: "Could not compose webcam with the screen. Recording will continue with screen only.",
          });
          screenStreamRef.current?.getVideoTracks().forEach(t => combinedStream.addTrack(t));
        }
      } else {
        screenStreamRef.current?.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      }

      // Add system audio from screen
      const mixedAudioTrack = await ensureMixedAudioTrack();
      if (mixedAudioTrack) {
        combinedStream.addTrack(mixedAudioTrack);
      } else if (isVoiceEnabled) {
        // Helpful hint for users when audio isn't captured
        const hasScreenAudio = (screenStreamRef.current?.getAudioTracks()?.length ?? 0) > 0;
        if (!hasScreenAudio) {
          showToast({
            title: "No system audio detected",
            description: "If you're capturing a browser tab, enable “Share audio” in the capture dialog. Window/screen capture may not provide system audio in some browsers.",
          });
        }
      }

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstart = () => {
        setState('recording');
        setDuration(0);
        intervalRef.current = setInterval(() => setDuration(p => p + 1), 1000);
        showToast({ title: "Recording started" });
      };

      recorder.onstop = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (recordedChunksRef.current.length > 0) {
          setHasRecording(true);
        }
        setState('idle');
      };

      recorder.onerror = () => {
        setError('Recording failed unexpectedly.');
        setState('idle');
        showToast({
          variant: "destructive",
          title: "Recording failed",
          description: "Recording failed unexpectedly.",
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsPreviewing(true);

    } catch (err) {
      console.error('Recording error:', err);
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      showToast({ variant: "destructive", title: "Could not start recording", description: message });
      setState('idle');
    }
  }, [getScreenStream, isVoiceEnabled, isFaceVideoEnabled, ensureCompositeStream, ensureMixedAudioTrack]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      showToast({ title: "Recording paused" });
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      intervalRef.current = setInterval(() => setDuration(p => p + 1), 1000);
      showToast({ title: "Recording resumed" });
    }
  }, []);

  const downloadRecording = useCallback(() => {
    if (recordedChunksRef.current.length === 0) return;
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recordedChunksRef.current = [];
    setHasRecording(false);
    showToast({ title: "Download started" });
  }, []);

  const toggleVoice = useCallback(() => {
    if (state === 'recording' || state === 'paused') return;
    setIsVoiceEnabled(prev => {
      const next = !prev;
      if (!next && micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      return next;
    });
  }, [state]);

  const toggleFaceVideo = useCallback(() => {
    if (state === 'recording' || state === 'paused') return;
    setIsFaceVideoEnabled(prev => {
      const next = !prev;
      if (!next && webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(t => t.stop());
        webcamStreamRef.current = null;
        setWebcamStream(null);
      } else if (next && isPreviewing) {
        // Start webcam if previewing
        getWebcamStream().then(stream => {
          if (stream) {
            webcamStreamRef.current = stream;
            setWebcamStream(stream);
          }
        });
      }
      return next;
    });
  }, [state, isPreviewing]);

  return {
    state,
    isRecording: state === 'recording',
    duration,
    error,
    screenStream,
    webcamStream,
    isVoiceEnabled,
    isFaceVideoEnabled,
    isPreviewing,
    hasRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    startPreview,
    stopPreview,
    toggleVoice,
    toggleFaceVideo,
  };
};
