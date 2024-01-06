import Player from './player.js';
export default class Team {
    constructor() {
        this.playerOne = null;
        this.playerTwo = null;

        // Hands won in the current round
        this.handsWon = 0;

        // Number of rounds won (handsWon = 7)
        this.points = 0;
    }

    /**
     * Adds a player to a team if there is a slot available and returns true, returns false otherwise.
     * @param playerId
     * @param playerName
     * @returns {boolean}
     */
    addPlayer({playerId, playerName}) {
        if(this.playerOne === null) {
            this.playerOne = new Player(playerId, playerName);
            return true;
        }

        if(this.playerTwo === null) {
            this.playerTwo = new Player(playerId, playerName);
            return true;
        }

        return false;
    }

    isFull() {
        return this.playerOne !== null && this.playerTwo !== null;
    }

}