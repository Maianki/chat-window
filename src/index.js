const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const express = require("express");
const app = express();
const {
  newUser,
  getIndividualRoomUsers,
  getActiveUser,
  exitRoom,
} = require("./utils/userHelper");
const formatMessage = require("./utils/formatHelper");

const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, "./../public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = newUser(socket.id, username, room);
    socket.join(user.room);
    socket.emit(
      "message",
      formatMessage(
        "Airtribe",
        "Message on this channel are limited to this room only."
      )
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Airtribe", `${user.username} has joined the room`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getIndividualRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (message) => {
    const user = getActiveUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  socket.on("disconnect", () => {
    const user = exitRoom(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Airtribe", `${user.username} has left the room.`)
      );
    }
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getIndividualRoomUsers,
    });
  });
});


server.listen(3000, function () {
  // eslint-disable-next-line no-console
  console.log("Express server listening on port " + 3000);
});