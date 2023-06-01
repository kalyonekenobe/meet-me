const http = require('http');
const { Server } = require("socket.io");

class Socket {

    #app
    constructor(app) {
        this.#app = app
    }

    configure() {
        const server = http.createServer(this.#app);
        const io = new Server(server);

        io.on('connection', socket => {
            console.log(`User connected at ${new Date().toLocaleString()}`)

            socket.on('join-chat', chats => {
                console.log(`User joined ${chats}`)
                socket.join(chats);
            });

            socket.on('send-message', (payload, chat) =>{
                io.in(chat).emit('receive-message', { ...payload, chatId: chat });
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected at ${new Date().toLocaleString()}`)
            })
        })

        io.listen(process.env.SOCKET_PORT, {
            cors: {
                origin: `http://localhost:${process.env.PORT || 8000}`
            }
        })
    }
}

module.exports = Socket