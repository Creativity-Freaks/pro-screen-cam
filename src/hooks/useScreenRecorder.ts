import { useState, useRef, useCallback, useEffect } from 'react';

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopAllStreams = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    webcamStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    webcamStreamRef.current = null;
    micStreamRef.current = null;
    setScreenStream(null);
    setWebcamStream(null);
  };

  const getScreenStream = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen recording is not supported in this browser.');
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true, // system audio
    });
    // When user clicks "Stop sharing" in browser UI
    stream.getVideoTracks()[0].onended = () => {
      if (state === 'recording' || state === 'paused') {
        stopRecording();
      } else {
        stopPreview();
      }
    };
    return stream;
  };

  const getWebcamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      return stream;
    } catch (e) {
      console.warn('Webcam unavailable:', e);
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
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start preview');
      stopAllStreams();
    }
  }, [isFaceVideoEnabled, isVoiceEnabled]);

  const stopPreview = useCallback(() => {
    stopAllStreams();
    setIsPreviewing(false);
  }, []);

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

      // Add screen video
      screenStreamRef.current?.getVideoTracks().forEach(t => combinedStream.addTrack(t));

      // Add system audio from screen
      screenStreamRef.current?.getAudioTracks().forEach(t => combinedStream.addTrack(t));

      // Add mic audio
      if (isVoiceEnabled && micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(t => combinedStream.addTrack(t));
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
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsPreviewing(true);

    } catch (err) {
      console.error('Recording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, [isVoiceEnabled, isFaceVideoEnabled]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
    }
    // Stop all streams
    stopAllStreams();
    setIsPreviewing(false);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      intervalRef.current = setInterval(() => setDuration(p => p + 1), 1000);
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
