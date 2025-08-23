import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Monitor, VideoOff } from 'lucide-react';

interface PreviewWindowProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export const PreviewWindow = ({ stream, isRecording }: PreviewWindowProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="relative overflow-hidden bg-gradient-glass backdrop-blur-sm border-border/50">
      <div className="aspect-video bg-muted/20 flex items-center justify-center relative">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Monitor className="h-16 w-16 opacity-50" />
            <p className="text-lg font-medium">No preview available</p>
            <p className="text-sm text-center max-w-sm">
              Start recording to see your screen capture preview
            </p>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-recording text-recording-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse-recording">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span>RECORDING</span>
          </div>
        )}

        {/* Camera Preview Overlay */}
        {stream && (
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-border/50 bg-gradient-glass backdrop-blur-sm">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <VideoOff className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};