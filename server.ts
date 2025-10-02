import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { subscriber, TASK_UPDATE_CHANNEL } from "./lib/pubsub.js";

const httpServer = createServer();

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("[WS] A user connected ", socket.id);

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`[WS] user ${socket.id} joined room ${roomName}`);
  });
  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`[WS] user ${socket.id} left room ${roomName}`);
  });
  socket.on("disconnect", () => {
    console.log(`[WS] user ${socket.id} disconnected`);
  });
});

subscriber.subscribe(TASK_UPDATE_CHANNEL, (err, count) => {
  if (err) {
    console.error(`[Redis] Failed to subscribe >>`, err.message);
  } else {
    console.log(
      `[Redis] Subscribed to ${TASK_UPDATE_CHANNEL}. Listening for ${count} channels`
    );
  }
});

subscriber.on("message", (channel, message) => {
  if (channel === TASK_UPDATE_CHANNEL) {
    console.log(`[Redis] Reecieved message on channel : ${channel}`);
    const updateData = JSON.parse(message);

    io.emit("taskUpdate", updateData);
  }
});

const WS_PORT = 3001;
httpServer.listen(WS_PORT, () => {
  console.log(`[WS] Server is running on port ${WS_PORT}`);
});

export default io;
