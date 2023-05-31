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

            socket.on('join-chat', chat => {
                console.log(`User joined chat ${chat}`)
                socket.join(chat);
            });

            socket.on('send-message', (message, chat) =>{
                io.in(chat).emit('receive-message', message);
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