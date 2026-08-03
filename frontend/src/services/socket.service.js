import { io } from "socket.io-client";

// Singleton connection opened once by useSocket. Auth is sent through the
// HTTP-only cookie that the backend set during login.
let socket = null;

export function connectSocket() {
    if (socket) return socket;
    socket = io({ withCredentials: true });
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
    const activeSocket = getSocket();
    if (!activeSocket) return false;
    activeSocket.emit("start_recording", { title, participants });
    return true;
}
