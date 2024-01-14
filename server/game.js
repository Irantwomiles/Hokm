import Team from "./team.js";
import Deck from './deck.js';
import {io} from './server_manager.js';

export default class Game {
    constructor(id, socketId, playerData) {
        this.id = id;
        this.roomName = `${playerData.playerName}'s lobby`;

        this.teamOne = new Team();
        this.teamTwo = new Team();

        this.teamOne.addPlayer(socketId, playerData);

        this.deck = new Deck();
        this.deck.shuffle();

        /*
        WAITING: waiting for players to join
        PICK_HAKEM: Select who is going to be the HAKEM
        PICK_HOKM: HAKEM will select the suit to be HOKM and then all cards will be passed to players
        GAME_STARTED: Start the game by letting the HAKEM place the first card down
         */

        this.gameState = 'WAITING';

        this.gameTimer = null;

        this.hakem = null;
        this.hokm = '';

        this.placementOrder = [];
        this.placementTurn = 0;

        this.currentRoundSuit = null;

        this.cardsDown = [];
    }

    /**
     * Adds player to a non-full team if there is one and returns true, returns false otherwise.
     * @param socketId
     * @param playerData
     * @returns {boolean}
     */
    joinGame(socketId, playerData) {
        if(!this.teamOne.isFull()) {
            this.teamOne.addPlayer(socketId, playerData);
            return true;
        }

        if(!this.teamTwo.isFull()) {
            this.teamTwo.addPlayer(socketId, playerData);
            return true;
        }

        return false;
    }

    startGame() {

        if(this.gameState !== 'WAITING') {
            console.log(`[Server] game state is not WAITING, is ${this.gameState}`);
            return false;
        }

        if(!this.isGameFull()) {
            console.log(`[Server] game can't start unless full ${this.getPlayers().length}`);
            return false;
        }

        this.gameState = 'PICK_HAKEM';

        this.handleSelectHakem();
        // this.gameTimer = setInterval(this.handleGameLoop, 1000);
    }

    handleSelectHakem() {
        let randomNumber = Math.floor(Math.random() * 4) + 1;
        switch(randomNumber) {
            case 1:
                this.hakem = this.teamOne.playerOne.getPlayerInfo();
                break;
            case 2:
                this.hakem = this.teamOne.playerTwo.getPlayerInfo();
                break;
            case 3:
                this.hakem = this.teamTwo.playerOne.getPlayerInfo();
                break;
            case 4:
                this.hakem = this.teamTwo.playerTwo.getPlayerInfo();
                break;
            default:
                break;
        }

        console.log(`[Server] Selected HAKEM ${this.hakem.name}`);

        this.gameState = 'PICK_HOKM';

        const players = this.getPlayers();
        let idx = 0;
        for(const player of players) {
            player.cards.push(...this.deck.cards.slice(idx, idx + 5));
            idx += 5;
        }

        this.updateGameState();

        console.log(`[Server] Waiting for HAKEM ${this.hakem.name} to pick a HOKM`);

        // emit signal to select a Hokm

        // Select a random suit for HOKM if the HAKEM doesn't select one
        this.gameTimeout = setTimeout(() => {
            const suits = ['HEART', 'SPADE', 'CLOVER', 'DIAMOND'];
            const suit = suits[Math.floor(Math.random() * suits.length)];

            this.handleSelectHokm(this.hakem.id, suit);
            console.log(`[Server] HAKEM did not select HOKM in the alloted time, picked one automatically ${this.hokm}`);
        }, 1000 * 20);
    }

    handleSelectHokm(id, suit) {

        if(id !== this.hakem.id) {
            console.log(`[Server] ${id} is not the hakem ${this.hakem.id}`);
            return;
        }

        if(this.gameState !== 'PICK_HOKM') {
            console.log(`[Server] Game state is not PICK_HOKM, is ${this.gameState}`);
            return;
        }

        if(suit !== 'HEART' && suit !== 'SPADE' && suit !== 'CLOVER' && suit !== 'DIAMOND') {
            console.log(`[Server] Invalid suit ${suit}`);
            return;
        }

        this.hokm = suit;

        console.log(`[Server] Selected suit ${suit}`);

        const players = this.getPlayers();
        const availableCards = this.deck.cards.slice(20, 52);
        let idx = 0;
        while(idx <= 52) {
            for(const player of players) {
                player.cards.push(...availableCards.slice(idx, idx + 4));
                idx += 4;
            }
        }

        this.setPlacementOrder(this.hakem.id);

        this.gameState = 'PLACE_CARD';

        clearTimeout(this.gameTimeout);

        this.updateGameState();
        console.log(`[Server] Game started ${this.gameState}`);
    }

    getPlayers() {
        return [this.teamOne.playerOne, this.teamOne.playerTwo, this.teamTwo.playerOne, this.teamTwo.playerTwo];
    }

    isGameFull() {
        return this.teamOne.isFull() && this.teamTwo.isFull();
    }

    isHakem(id) {
        return id !== null && id === this.hakem;
    }

    setPlacementOrder(id) {

        switch(id) {
            case this.teamOne.playerOne.id: {
                this.placementOrder = [this.teamOne.playerOne.id, this.teamTwo.playerOne.id, this.teamOne.playerTwo.id, this.teamTwo.playerTwo.id];
                break;
            }
            case this.teamOne.playerTwo.id: {
                this.placementOrder = [this.teamOne.playerTwo.id, this.teamTwo.playerTwo.id, this.teamOne.playerOne.id, this.teamTwo.playerOne.id];
                break;
            }
            case this.teamTwo.playerOne.id: {
                this.placementOrder = [this.teamTwo.playerOne.id, this.teamOne.playerOne.id, this.teamTwo.playerTwo.id, this.teamOne.playerTwo.id];
                break;
            }
            case this.teamTwo.playerTwo.id: {
                this.placementOrder = [this.teamTwo.playerTwo.id, this.teamOne.playerTwo.id, this.teamTwo.playerOne.id, this.teamOne.playerOne.id];
                break;
            }
            default:
                break;
        }
    }

    placeDownCard(playerId, cardId) {

        if(this.gameState !== 'PLACE_CARD') {
            console.log(`[Server] Game must be in PLACE_CARD ${this.gameState}`);
            return;
        }

        if(this.placementOrder[this.placementTurn] !== playerId) {
            console.log(`[Server] It is not your turn to place down a card ${this.placementOrder[this.placementTurn]}!=${playerId}`);
            return;
        }

        if(this.cardsDown >= 4) {
            console.log(`[Server] There can only be 4 cards down at a time ${this.cardsDown.length}`);
            return;
        }

        const player = this.getPlayer(playerId);

        if(!player) {
            console.log(`[Server] Could not find player with id ${playerId}`);
            return;
        }

        const card = player.cards.find(c => c.id === cardId);

        if(!card) {
            console.log(`[Server] could not find card with id ${cardId}`);
            return;
        }

        if(card.placed) {
            console.log(`[Server] this card was already placed down ${card.id}`);
            return;
        }

        if(this.currentRoundSuit === null) {
            this.currentRoundSuit = card.suit;
        } else {

            // card does not match the current suit of the round
            if(card.suit !== this.currentRoundSuit) {

                if(this.handHasSuit(player.cards, this.currentRoundSuit)) {
                    console.log(`[Server] you must place down a card with the suit ${this.currentRoundSuit}`);
                    return;
                }
            }
        }


        card.placed = true;

        this.cardsDown.push({card, playerId: player.id});

        console.log(`[Server] placed card down. card: ${cardId}, placementTurn: ${this.placementTurn}`);

        if(this.cardsDown.length === 4) {
            //calculate who won the round
            let max = null;
            for(const c of this.cardsDown) {
                if(max === null) {
                    max = c;
                } else {
                    if(c.card.suit !== this.currentRoundSuit && c.card.suit !== this.hokm) continue;

                    const value = c.card.suit === this.hokm ? c.card.value * 100 : c.card.value;

                    if(max.card.value < value) {
                        max = c;
                    }
                }
            }

            const team = this.getPlayerTeam(max.playerId);
            if(team === null) {
                console.log(`[Server] player team is null, should not be happening ${max.playerId}`);
                return;
            }

            team.points++;

            this.gameState = 'BETWEEN_HANDS';
            this.updateGameState();

            this.gameTimeout = setTimeout(() => {
                this.placementTurn = 0;
                this.currentRoundSuit = null;
                this.cardsDown = [];
                this.setPlacementOrder(max.playerId);

                this.updateGameState();
                this.gameState = 'PLACE_CARD';
            }, 3000);

            return;
        }

        this.placementTurn++;
        this.updateGameState();
    }

    getPlayer(id) {
        for(const p of this.getPlayers()) {
            if(p !== null && p.id === id) return p;
        }

        return null;
    }

    handHasSuit(cards, suit) {
        for(const c of cards) {
            if(c.suit === suit && !c.placed) return true;
        }

        return false;
    }

    getPlayerTeam(playerId) {
        if(this.teamOne.playerOne.id === playerId || this.teamOne.playerTwo.id === playerId) {
            return this.teamOne;
        }

        if(this.teamTwo.playerOne.id === playerId || this.teamTwo.playerTwo.id === playerId) {
            return this.teamTwo;
        }

        return null;
    }

    getGameState() {

        const p1 = this.teamOne.playerOne ? this.teamOne.playerOne.getPlayerInfo() : null;
        const p2 = this.teamOne.playerTwo ? this.teamOne.playerTwo.getPlayerInfo() : null;
        const p3 = this.teamTwo.playerOne ? this.teamTwo.playerOne.getPlayerInfo() : null;
        const p4 = this.teamTwo.playerTwo ? this.teamTwo.playerTwo.getPlayerInfo() : null;

        return {
            id: this.id,
            roomName: this.roomName,
            deck: this.deck,
            gameState: this.gameState,
            gameTimer: this.gameTimer,
            hakem: this.hakem,
            hokm: this.hokm,
            placementOrder: this.placementOrder,
            placementTurn: this.placementTurn,
            currentRoundSuit: this.currentRoundSuit,
            cardsDown: this.cardsDown,
            teamOne: [p1, p2],
            teamTwo: [p3, p4],
            allPlayers: [p1, p2, p3, p4]
        }
    }

    /**
     * Update the game state and send each player their cards individually
     */
    updateGameState() {
        io.to(this.id).emit('update-game-state', this.getGameState());
        for(const player of this.getPlayers()) {
            if(player === null) continue;

            try {
                io.to(player.socketId).emit('update-player-cards', player.cards);
            } catch(e) {
                console.log(e);
            }
        }
    }

}