export default class Player {

    constructor(socketId, id, name) {
        this.id = id;
        this.name = name;
        this.socketId = socketId;

        this.hasPlayed = false;

        this.cards = [];
    }

    getPlayerInfo() {
        return {
            id: this.id,
            name: this.name
        }
    }

}