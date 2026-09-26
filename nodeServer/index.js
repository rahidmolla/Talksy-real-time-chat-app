const { Server } = require("socket.io");
const PORT = process.env.PORT || 8000;
const io = new Server(8000, {
    cors: {
        origin: "http://rahidmolla.github.io",
        methods: ["GET", "POST"]
    }
});


const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('received', {message: message, name: users[socket.id]})

    });
    
socket.on('disconnect', message => {
        socket.broadcast.emit('leave', users[socket.id]);
        delete users[socket.id];

    });
})