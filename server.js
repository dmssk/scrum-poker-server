var app = require("express")();
var http = require("http").createServer(app);
const PORT = 8080;
var io = require("socket.io")(http);

const selectedCards = [
  {
    value: "2",
    userId: 0,
    userName: "test",
  },
];
var STATIC_DATA = {
  usersCount: 0,
  selectedCards: [],
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

io.on("connection", (socket) => {
  // socket object may be used to send specific messages to the new connected client

  STATIC_DATA.usersCount += 1;
  console.log("new client connected", STATIC_DATA.usersCount);
  io.emit("card-selected", STATIC_DATA);
  socket.emit("connection", null);

  socket.on("card-select", (data) => {
    if (STATIC_DATA.selectedCards.find((item) => item.userId === data.userId)) {
      const other = STATIC_DATA.selectedCards.filter(
        (item) => item.userId !== data.userId
      );
      const current = STATIC_DATA.selectedCards.find(
        (item) => item.userId === data.userId
      );
      current.value = data.value;
      current.userName = data.userName;
      STATIC_DATA.selectedCards = [...other, current];
    } else {
      STATIC_DATA.selectedCards.push(data);
    }
    io.emit("card-selected", STATIC_DATA);
  });

  socket.on("delete-card", (userId) => {
    const other = STATIC_DATA.selectedCards.filter(
      (item) => item.userId !== userId
    );
    STATIC_DATA.selectedCards = other;
    io.emit("card-selected", STATIC_DATA);
  });

  socket.on("card-reveal", () => {
    io.emit("on-reveal-card");
  });

  socket.on("disconnect", () => {
    socket.emit("disconnecting");
    STATIC_DATA.usersCount -= 1;
    io.emit("card-selected", STATIC_DATA);
  });
});

/**
 * @description This methos retirves the static channels
 */
app.get("/getData", (req, res) => {
  res.json({
    data: STATIC_DATA,
  });
});
