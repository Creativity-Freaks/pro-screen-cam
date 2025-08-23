import { Card } from '@/components/ui/card';
import { Clock, Circle, Pause, Settings2 } from 'lucide-react';
import { RecordingState } from '@/hooks/useScreenRecorder';

interface RecordingStatusProps {
  state: RecordingState;
  duration: number;
  error: string | null;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getStatusConfig = (state: RecordingState) => {
  switch (state) {
    case 'recording':
      return {
        icon: Circle,
        text: 'Recording',
        color: 'text-recording',
        bgColor: 'bg-recording/10',
        animate: 'animate-pulse-recording'
      };
    case 'paused':
      return {
        icon: Pause,
        text: 'Paused',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        animate: ''
      };
    case 'processing':
      return {
        icon: Settings2,
        text: 'Processing',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        animate: 'animate-spin'
      };
    default:
      return {
        icon: Circle,
        text: 'Ready',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/10',
        animate: ''
      };
  }
};

export const RecordingStatus = ({ state, duration, error }: RecordingStatusProps) => {
  const statusConfig = getStatusConfig(state);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.color} ${statusConfig.animate}`} />
            </div>
            <div>
              <p className="font-medium text-foreground">{statusConfig.text}</p>
              <p className="text-sm text-muted-foreground">
                {state === 'idle' ? 'Click to start recording' : 'Screen recording in progress'}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2 text-right">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-mono font-bold text-foreground">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-destructive/20">
              <Circle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-destructive">Recording Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};