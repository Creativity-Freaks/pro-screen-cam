import { Button } from '@/components/ui/button';
import { PlayCircle, Square, Pause, Play, Download, Settings, Video, Mic, Monitor } from 'lucide-react';
import { RecordingState } from '@/hooks/useScreenRecorder';

interface RecordingControlsProps {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDownload: () => void;
  hasRecording: boolean;
}

export const RecordingControls = ({
  state,
  onStart,
  onStop,
  onPause,
  onResume,
  onDownload,
  hasRecording
}: RecordingControlsProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Recording Button */}
      <div className="flex justify-center">
        {state === 'idle' ? (
          <Button
            onClick={onStart}
            variant="recording"
            size="lg"
            className="h-20 w-20 rounded-full text-lg font-bold shadow-recording"
          >
            <PlayCircle className="h-8 w-8" />
          </Button>
        ) : state === 'recording' ? (
          <div className="flex space-x-4">
            <Button
              onClick={onPause}
              variant="preview"
              size="lg"
              className="h-16 w-16 rounded-full"
            >
              <Pause className="h-6 w-6" />
            </Button>
            <Button
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="h-20 w-20 rounded-full shadow-recording"
            >
              <Square className="h-8 w-8" />
            </Button>
          </div>
        ) : state === 'paused' ? (
          <div className="flex space-x-4">
            <Button
              onClick={onResume}
              variant="live"
              size="lg"
              className="h-16 w-16 rounded-full"
            >
              <Play className="h-6 w-6" />
            </Button>
            <Button
              onClick={onStop}
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full"
            >
              <Square className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <Button
            disabled
            variant="preview"
            size="lg"
            className="h-20 w-20 rounded-full animate-pulse"
          >
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
          </Button>
        )}
      </div>

      {/* Secondary Controls */}
      <div className="flex space-x-4">
        {hasRecording && state === 'idle' && (
          <Button
            onClick={onDownload}
            variant="live"
            size="lg"
            className="flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Download</span>
          </Button>
        )}
        
        <Button variant="preview" size="lg" className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Button>
      </div>

      {/* Source Indicators */}
      <div className="flex space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Monitor className="h-4 w-4 text-live" />
          <span>Screen</span>
        </div>
        <div className="flex items-center space-x-2">
          <Mic className="h-4 w-4 text-accent" />
          <span>Audio</span>
        </div>
        <div className="flex items-center space-x-2">
          <Video className="h-4 w-4 text-preview" />
          <span>Camera</span>
        </div>
      </div>
    </div>
  );
};