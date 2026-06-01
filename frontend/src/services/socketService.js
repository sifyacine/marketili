import { io } from "socket.io-client";

const BACKEND_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

let _socket = null;

export const getSocket = () => {
  if (!_socket) {
    _socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return _socket;
};

export const disconnectSocket = () => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
};
