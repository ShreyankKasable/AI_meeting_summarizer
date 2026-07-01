import { io } from "socket.io-client";

// Singleton connection, mirroring api.service.js's setAuthToken pattern — the
// connection is opened once (by useSocket, called near the top of App.jsx)
// and any component can emit through it afterwards without re-connecting.
let socket = null;

export function connectSocket(token) {
    if (socket) return socket;
    socket = io({ auth: { token } });
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket() {
    return socket;
}

export function emitStartRecording(title, participants) {
    getSocket()?.emit("start_recording", { title, participants });
}
