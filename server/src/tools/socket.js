const io = require('socket.io')(3000,{
    cors:{
        origin:['http://localhost:8000']
    }
});

io.on('connection',socket => {
    socket.on('room-connect',room => {
        socket.join(room);
    });
    socket.on('send-message',(message,room) =>{
        socket.to(room).emit('receive-message',message);
    });
});
module.exports = io;
