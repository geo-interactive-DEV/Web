const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', socket => {
    console.log('New player:', socket.id);
    players[socket.id] = { x: 100, y: 100 };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, x: 100, y: 100 });

    socket.on('playerMovement', movementData => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            socket.broadcast.emit('playerMoved', { id: socket.id, x: movementData.x, y: movementData.y });
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
