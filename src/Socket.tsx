import { io, Socket } from "socket.io-client";

// Define your Socket.IO connection URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000/";
//process.env.REACT_APP_SERVER_URL || 

// Create a singleton for the socket connection
let socket: Socket | null = null;
export const getSocket = (): Socket => {
    // console.log(socket?.active);
    if (!socket) {
        socket = io(SERVER_URL, {
            autoConnect: false,
        });
        console.log("Connected to server");
    }
    return socket;
};

export const connectSocket = (): Socket => {
    const socketInstance = getSocket();
    if (!socketInstance.connected) {
        socketInstance.connect(); // Manually connect
        // console.log("Socket manually connected");
    }
    return socketInstance;
};