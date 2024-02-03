import {io, server} from './server_manager.js';
import { v4 as uuid } from 'uuid';
import 'path';

import GameManager from "./game_manager.js";

const PORT = 3030;

const gameManager = new GameManager();

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);

        const gameId = gameManager.players.get(socket.id);
        if(!gameId) return;

        const game = gameManager.getGame(gameId);
        if(game === null) return;

        game.removePlayer(socket.id);

        gameManager.players.delete(socket.id);

        if(game.gameState !== 'WAITING') {
            io.to(game.id).emit('game-end');
            gameManager.endGame(game.id);
            console.log("Deleted game, player left mid game");
            return;
        }


        if(game.getPlayers().filter(p => p !== null).length === 0) {
            gameManager.endGame(game.id);
            console.log("Deleted game, no players left");
            return;
        }

        console.log("just removed player from game");
    })

    socket.on('get-lobbies', () => {
        socket.emit('lobbies', Array.from(gameManager.games, ([id, value]) => ({id, value: value.getGameState()})));
    })

    socket.on('create-room', ({playerName}) => {
        const game = gameManager.createGame(socket, {playerId: socket.id, playerName: playerName});
        socket.emit('create-room-response', game.getGameState());
    });

    socket.on('join-room', async ({roomId, playerName}) => {
        await gameManager.joinGame(io, socket, roomId, {playerId: socket.id, playerName: playerName});
    });

    socket.on('start-game', ({gameId}) => {
        const game = gameManager.getGame(gameId);
        if(!game) {
            console.log(`[Server] start-game could not find game with id ${gameId}`);
            return;
        }

        game.startGame();
    })

    socket.on('select-hokm', ({suit}) => {

        const gameId = gameManager.players.get(socket.id);
        if(!gameId) {
            console.log("could not find gameId select-hokm");
            return;
        }

        const game = gameManager.getGame(gameId);
        if(game === null) {
            console.log("could not find game select-hokm");
            return;
        }

        if(!game) {
            console.log(`[Server] select-hokm could not find game with id ${gameId}`);
            return;
        }

        const s = getSuit(suit);
        if(s.length === 0) {
            console.log("could not find suit select-hokm", s);
            return;
        }

        game.handleSelectHokm(socket.id, s);
    })

    socket.on('place-card', ({gameId, cardId}) => {
        const game = gameManager.getGame(gameId);
        if(!game) {
            console.log(`[Server] place-card could not find game with id ${gameId}`);
            return;
        }

        game.placeDownCard(socket.id, cardId);
    })

    console.log(`${socket.id} a user connected`);
});

function getSuit(suit) {
    switch (suit) {
        case 'Hearts':
            return 'HEART';
        case 'Spades':
            return 'SPADE';
        case 'Clover':
            return 'CLOVER';
        case 'Diamonds':
            return 'DIAMOND';
        default:
            return '';
    }
}

server.listen(PORT, '10.204.87.185',() => {
    console.log(`listening on *:${PORT}`);
});
