import { io } from "socket.io-client";

// "" → same origin. When REACT_APP_API_URL is a relative "/api" (production
// behind the Netlify proxy), this resolves to the Netlify origin and Socket.io
// connects through the /socket.io proxy. An absolute URL (local dev) is used
// as-is.
const BACKEND_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

let _socket = null;

export const getSocket = () => {
  if (!_socket) {
    _socket = io(BACKEND_URL || undefined, {
      withCredentials: true,
      // Polling first: it works through the Netlify HTTP proxy. Socket.io will
      // transparently upgrade to websocket when the path supports it (direct
      // backend in dev); behind the proxy it stays on polling.
      transports: ["polling", "websocket"],
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
