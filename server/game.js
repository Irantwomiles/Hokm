import Team from "./team.js";
import Deck from './deck.js';
import {io} from './server_manager.js';

export default class Game {
    constructor(id, playerData) {
        this.id = id;
        this.roomName = `${playerData.playerName}'s lobby`;

        this.teamOne = new Team();
        this.teamTwo = new Team();

        this.teamOne.addPlayer(playerData);

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

        this.cardsDown = [];
    }

    /**
     * Adds player to a non-full team if there is one and returns true, returns false otherwise.
     * @param playerData
     * @returns {boolean}
     */
    joinGame(playerData) {
        if(!this.teamOne.isFull()) {
            this.teamOne.addPlayer(playerData);
            return true;
        }

        if(!this.teamTwo.isFull()) {
            this.teamTwo.addPlayer(playerData);
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
                this.hakem = this.teamOne.playerOne;
                break;
            case 2:
                this.hakem = this.teamOne.playerTwo;
                break;
            case 3:
                this.hakem = this.teamTwo.playerOne;
                break;
            case 4:
                this.hakem = this.teamTwo.playerTwo;
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

        io.to(this.id).emit('update-game-state', this);

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

        io.to(this.id).emit('update-game-state', this);
        console.log(`[Server] Game started ${this.gameState} ${this.getPlayers()}`);
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

    placeDownCard(playerId, cardIndex) {

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

        if(cardIndex > 12 || cardIndex < 0) {
            console.log(`[Server] card index must be between 0-12 inclusive ${cardIndex}`);
            return;
        }

        if(player.cards[cardIndex].placed) {
            console.log(`[Server] this card was already placed down ${cardIndex}`);
            return;
        }

        player.cards[cardIndex].placed = true;
        this.cardsDown.push(player.cards[cardIndex]);

        if(this.cardsDown.length === 4) {
            //calculate who won the round

            return;
        }

        this.placementTurn++;
    }

    getPlayer(id) {
        for(const p of this.getPlayers()) {
            if(p !== null && p.id === id) return p;
        }

        return null;
    }

}