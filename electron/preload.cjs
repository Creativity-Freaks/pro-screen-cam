const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApp", {
	isDesktop: true,
	chooseDesktopSource: () => ipcRenderer.invoke("desktop-source:choose"),
	selectDesktopSource: (sourceId) => ipcRenderer.send("desktop-source:selected", sourceId),
	cancelDesktopSourcePicker: () => ipcRenderer.send("desktop-source:cancel"),
	onDesktopSourceData: (listener) => {
		 const handler = (_event, payload) => listener(payload);
		 ipcRenderer.on("desktop-source:data", handler);
		 return () => ipcRenderer.removeListener("desktop-source:data", handler);
	},
	showRecordingControl: (payload) => ipcRenderer.send("recording-control:show", payload),
	updateRecordingControl: (payload) => ipcRenderer.send("recording-control:update", payload),
	hideRecordingControl: () => ipcRenderer.send("recording-control:hide"),
	emitRecordingControlAction: (action) => ipcRenderer.send("recording-control:action", action),
	onRecordingControlAction: (listener) => {
		const handler = (_event, action) => listener(action);
		ipcRenderer.on("recording-control:action", handler);
		return () => ipcRenderer.removeListener("recording-control:action", handler);
	},
	onRecordingControlState: (listener) => {
		const handler = (_event, payload) => listener(payload);
		ipcRenderer.on("recording-control:state", handler);
		return () => ipcRenderer.removeListener("recording-control:state", handler);
	},
});
