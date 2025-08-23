import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export interface UseScreenRecorderReturn {
  state: RecordingState;
  isRecording: boolean;
  duration: number;
  error: string | null;
  previewStream: MediaStream | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: () => void;
}

export const useScreenRecorder = (): UseScreenRecorderReturn => {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const startRecording = useCallback(async () => {
    try {
      clearError();
      setState('processing');

      // Get screen capture
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Get webcam stream
      let webcamStream: MediaStream | null = null;
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true
        });
      } catch (webcamError) {
        console.warn('Webcam access denied or unavailable:', webcamError);
      }

      // Combine streams
      const combinedStream = new MediaStream();
      
      // Add screen video track
      screenStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      // Add audio tracks (screen and/or microphone)
      screenStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      if (webcamStream) {
        webcamStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      streamRef.current = combinedStream;
      setPreviewStream(combinedStream);

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setState('recording');
        setDuration(0);
        
        // Start duration timer
        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      };

      mediaRecorder.onstop = () => {
        setState('processing');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Clean up streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (webcamStream) {
          webcamStream.getTracks().forEach(track => track.stop());
        }
        screenStream.getTracks().forEach(track => track.stop());
        
        setPreviewStream(null);
        setState('idle');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, [clearError]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      
      // Resume duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  }, [state]);

  const downloadRecording = useCallback(() => {
    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-recording-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Clear recorded chunks
      recordedChunksRef.current = [];
    }
  }, []);

  return {
    state,
    isRecording: state === 'recording',
    duration,
    error,
    previewStream,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
  };
};