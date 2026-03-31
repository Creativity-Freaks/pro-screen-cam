/// <reference types="vite/client" />

interface RecordingControlPayload {
	state: "idle" | "recording" | "paused" | "processing";
	duration: number;
}

interface DesktopSourceSelection {
	id: string;
	name: string;
}

type RecordingControlAction = "pause" | "resume" | "stop";

interface ElectronAppBridge {
	isDesktop: boolean;
	chooseDesktopSource: () => Promise<DesktopSourceSelection | null>;
	selectDesktopSource: (sourceId: string) => void;
	cancelDesktopSourcePicker: () => void;
	onDesktopSourceData: (listener: (payload: { sources: Array<DesktopSourceSelection & { type: "screen" | "window"; thumbnail: string | null }> }) => void) => () => void;
	showRecordingControl: (payload: RecordingControlPayload) => void;
	updateRecordingControl: (payload: RecordingControlPayload) => void;
	hideRecordingControl: () => void;
	emitRecordingControlAction: (action: RecordingControlAction) => void;
	onRecordingControlAction: (listener: (action: RecordingControlAction) => void) => () => void;
	onRecordingControlState: (listener: (payload: RecordingControlPayload) => void) => () => void;
}

interface Window {
	electronApp?: ElectronAppBridge;
}
