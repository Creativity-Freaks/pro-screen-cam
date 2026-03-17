import { useScreenRecorder } from '@/hooks/useScreenRecorder';
import { RecordingControls } from '@/components/RecordingControls';
import { PreviewWindow } from '@/components/PreviewWindow';
import { RecordingStatus } from '@/components/RecordingStatus';
import { Card } from '@/components/ui/card';
import { Monitor, Headphones, Camera } from 'lucide-react';

const Index = () => {
  const recorder = useScreenRecorder();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            ProScreenCam
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional screen recording with audio and face video.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 space-y-6">
            <PreviewWindow
              screenStream={recorder.screenStream}
              webcamStream={recorder.webcamStream}
              isRecording={recorder.isRecording}
            />

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-live/20">
                    <Monitor className="h-6 w-6 text-live" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Screen Capture</p>
                    <p className="text-sm text-muted-foreground">High quality recording</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Headphones className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Audio Recording</p>
                    <p className="text-sm text-muted-foreground">System + microphone</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-preview/20">
                    <Camera className="h-6 w-6 text-preview" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Face Video</p>
                    <p className="text-sm text-muted-foreground">Picture-in-picture</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Controls & Status */}
          <div className="space-y-6">
            <RecordingStatus state={recorder.state} duration={recorder.duration} error={recorder.error} />

            <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 p-6">
              <RecordingControls
                state={recorder.state}
                onStart={recorder.startRecording}
                onStop={recorder.stopRecording}
                onPause={recorder.pauseRecording}
                onResume={recorder.resumeRecording}
                onDownload={recorder.downloadRecording}
                hasRecording={recorder.hasRecording}
                isVoiceEnabled={recorder.isVoiceEnabled}
                isFaceVideoEnabled={recorder.isFaceVideoEnabled}
                isPreviewing={recorder.isPreviewing}
                onToggleVoice={recorder.toggleVoice}
                onToggleFaceVideo={recorder.toggleFaceVideo}
                onStartPreview={recorder.startPreview}
                onStopPreview={recorder.stopPreview}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
