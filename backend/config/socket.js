const { Server } = require("socket.io");

let _io = null;

const init = (server, corsOptions) => {
  _io = new Server(server, {
    cors: {
      origin:      corsOptions.origin,
      credentials: true,
      methods:     corsOptions.methods,
    },
    path: "/socket.io",
  });

  _io.on("connection", (socket) => {
    socket.on("join_user_room", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
    socket.on("join_conversation", (conversationId) => {
      if (conversationId) socket.join(`conv:${conversationId}`);
    });
    socket.on("leave_conversation", (conversationId) => {
      if (conversationId) socket.leave(`conv:${conversationId}`);
    });
  });

  return _io;
};

const getIo = () => _io;

module.exports = { init, getIo };
