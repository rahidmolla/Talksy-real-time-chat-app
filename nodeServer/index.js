const { Server } = require("socket.io");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
    let filePath;

    if (req.url === "/") {
        filePath = path.join(__dirname, "..", "index.html");
    } else {
        filePath = path.join(__dirname, "..", req.url);
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File not found");
            return;
        }

        let contentType = "text/html";

        if (filePath.endsWith(".css")) {
            contentType = "text/css";
        } else if (filePath.endsWith(".js")) {
            contentType = "application/javascript";
        } else if (filePath.endsWith(".png")) {
            contentType = "image/png";
        } else if (filePath.endsWith(".mp3")) {
            contentType = "audio/mpeg";
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(data);
    });
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on("connection", socket => {

    socket.on("new-user-joined", name => {
        users[socket.id] = name;
        socket.broadcast.emit("user-joined", name);
    });

    socket.on("send", message => {
        socket.broadcast.emit("received", {
            message: message,
            name: users[socket.id]
        });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("leave", users[socket.id]);
        delete users[socket.id];
    });

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});