import Game from './game.js';
import {v4 as uuid} from "uuid";
export default class GameManager {

    constructor() {
        this.games = new Map();
        this.players = new Map();
    }

    createGame(socket, playerData) {

        if(this.players.has(socket.id)) {
            const gameId = this.players.get(socket.id);
            if(gameId) {
                console.log(`[Server] you are already in a lobby`);
                return this.games.get(gameId);
            }

            return null;
        }

        const id = uuid();
        const game = new Game(id, playerData);

        this.games.set(id, game);
        socket.join(id);

        this.players.set(playerData.playerId, game.id);

        console.log(`[Server] Created game ${game.id} by player ${playerData.playerName}`);
        return game;
    }

    async joinGame(io, socket, id, playerData) {

        if(!this.games.has(id)) {
            console.log("No game found with id:", id);
            return null;
        }

        const game = this.games.get(id);

        // No slots left in either team
        if(game.isGameFull()) {
            console.log("Game is full:", id);
            return null;
        }

        // Check to see if user already in this room
        const sockets = await io.in(id).fetchSockets();

        for(const s of sockets) {
            if(s.id === socket.id) {
                console.log(`User ${socket.id} already in room ${id}`);
                return null;
            }
        }

        game.joinGame(playerData);
        socket.join(id);

        // send a message with the updated game state to the person joining
        socket.emit('join-room-response', game);

        // send a message to the entire room with updated game state
        socket.to(id).emit('update-game-state', game);

        console.log(`[Server] User ${playerData.playerName} joined lobby ${game.roomName} `);
        return game;
    }

    getGame(id) {
        if(this.games.has(id)) return this.games.get(id);
        return null;
    }

}