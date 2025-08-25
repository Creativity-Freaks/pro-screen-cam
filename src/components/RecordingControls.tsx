import { RecordingState } from '@/hooks/useScreenRecorder';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Circle, Square, Play, Pause, Download, Settings, Monitor, Headphones, Camera, Eye, EyeOff, Mic, MicOff } from 'lucide-react';

interface RecordingControlsProps {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDownload: () => void;
  hasRecording: boolean;
  isVoiceEnabled: boolean;
  isFaceVideoEnabled: boolean;
  isPreviewing: boolean;
  onToggleVoice: () => void;
  onToggleFaceVideo: () => void;
  onStartPreview: () => void;
  onStopPreview: () => void;
}

export const RecordingControls = ({
  state,
  onStart,
  onStop,
  onPause,
  onResume,
  onDownload,
  hasRecording,
  isVoiceEnabled,
  isFaceVideoEnabled,
  isPreviewing,
  onToggleVoice,
  onToggleFaceVideo,
  onStartPreview,
  onStopPreview,
}: RecordingControlsProps) => {
  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      {state === 'idle' && (
        <div className="space-y-4">
          {!isPreviewing ? (
            <Button
              onClick={onStartPreview}
              variant="outline"
              className="w-full h-12 border-2 border-preview text-preview hover:bg-preview/10"
            >
              <Eye className="mr-2 h-4 w-4" />
              Start Preview
            </Button>
          ) : (
            <Button
              onClick={onStopPreview}
              variant="outline"
              className="w-full h-12 border-2 border-muted text-muted-foreground hover:bg-muted/10"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Stop Preview
            </Button>
          )}
        </div>
      )}

      {/* Recording Settings */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <Settings className="h-4 w-4" />
          <span>Recording Settings</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isVoiceEnabled ? (
                <Mic className="h-4 w-4 text-accent" />
              ) : (
                <MicOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Voice Recording</span>
            </div>
            <Switch
              checked={isVoiceEnabled}
              onCheckedChange={onToggleVoice}
              disabled={state === 'recording' || state === 'paused'}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isFaceVideoEnabled ? (
                <Camera className="h-4 w-4 text-preview" />
              ) : (
                <Camera className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Face Video</span>
            </div>
            <Switch
              checked={isFaceVideoEnabled}
              onCheckedChange={onToggleFaceVideo}
              disabled={state === 'recording' || state === 'paused'}
            />
          </div>
        </div>
      </Card>

      {/* Main Controls */}
      <div className="space-y-4">
        {state === 'idle' && (
          <Button
            onClick={onStart}
            className="w-full h-14 bg-live hover:bg-live/90 text-white font-semibold text-lg"
          >
            <Circle className="mr-2 h-5 w-5 fill-current" />
            Start Recording
          </Button>
        )}

        {state === 'recording' && (
          <div className="space-y-3">
            <Button
              onClick={onPause}
              variant="outline"
              className="w-full h-12 border-2 border-preview text-preview hover:bg-preview/10"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            
            <Button
              onClick={onStop}
              className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          </div>
        )}

        {state === 'paused' && (
          <div className="space-y-3">
            <Button
              onClick={onResume}
              className="w-full h-12 bg-live hover:bg-live/90 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
            
            <Button
              onClick={onStop}
              variant="outline"
              className="w-full h-12 border-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          </div>
        )}

        {hasRecording && state === 'idle' && (
          <Button
            onClick={onDownload}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Recording
          </Button>
        )}
      </div>

      {/* Source Status */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-background border border-border">
          <Monitor className="h-5 w-5 text-live" />
          <span className="text-xs text-muted-foreground">Screen</span>
        </div>
        
        <div className={`flex flex-col items-center space-y-2 p-3 rounded-lg bg-background border border-border ${!isVoiceEnabled ? 'opacity-50' : ''}`}>
          {isVoiceEnabled ? (
            <Headphones className="h-5 w-5 text-accent" />
          ) : (
            <Headphones className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">Audio</span>
        </div>
        
        <div className={`flex flex-col items-center space-y-2 p-3 rounded-lg bg-background border border-border ${!isFaceVideoEnabled ? 'opacity-50' : ''}`}>
          {isFaceVideoEnabled ? (
            <Camera className="h-5 w-5 text-preview" />
          ) : (
            <Camera className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">Camera</span>
        </div>
      </div>
    </div>
  );
};