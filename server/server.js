const { instrument } = require("@socket.io/admin-ui");

const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:8080',
            'https://admin.socket.io'],
        credentials: true
    }
})
const userIo = io.of('/user') //creating a user namespace and connecting it to the toute
userIo.on('connection', socket => {
    console.log('connected to user namespace with username' + socket.username)
})

userIo.use((socket, next) => { //registering middleware 
    if (socket.handshake.auth.token) {
        socket.username = getUsernameFromToken(socket.handshake.auth.token)
        next()
    }
    next(new Error('please send token'))
})
function getUsernameFromToken(token) {
    return token
}
io.on('connection', socket => {
    console.log(socket.id)
    socket.on('send-message', (mess, room) => {
        // io.emit('receive-message', mess) //this tells our client to send a mess to every cliet out ther
        if (!room) {

            socket.broadcast.emit('receive-message', mess) // this sends a mess to every other socket aprt from the on that sends it
        } else {
            socket.to(room).emit('receive-message', mess)
        }
        socket.on('join-room', (room, cb) => {
            socket.join(room)
            cb(`Joined ${room}`)
        })
        // console.log(mess)
    })
})
instrument(io, { auth: false });