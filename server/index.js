import {io, server} from './server_manager.js';
import { v4 as uuid } from 'uuid';
import 'path';

import GameManager from "./game_manager.js";

const PORT = 3030;

const gameManager = new GameManager();

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    })

    socket.on('get-lobbies', () => {
        socket.emit('lobbies', Array.from(gameManager.games, ([id, value]) => ({id, value})));
    })

    socket.on('create-room', ({playerName}) => {
        const game = gameManager.createGame(socket, {playerId: socket.id, playerName: playerName});
        socket.emit('create-room-response', game);
    });

    socket.on('join-room', async ({roomId, playerName}) => {
        const game = await gameManager.joinGame(io, socket, roomId, {playerId: socket.id, playerName: playerName});
        console.log(roomId, playerName);
    });

    socket.on('start-game', ({gameId}) => {
        const game = gameManager.getGame(gameId);
        if(!game) {
            console.log(`[Server] start-game could not find game with id ${gameId}`);
            return;
        }

        game.startGame();
    })

    socket.on('select-hokm', ({gameId, suit}) => {
        const game = gameManager.getGame(gameId);
        if(!game) {
            console.log(`[Server] select-hokm could not find game with id ${gameId}`);
            return;
        }

        game.handleSelectHokm(socket.id, suit);
    })

    console.log(`${socket.id} a user connected`);
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
