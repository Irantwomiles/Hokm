export default class Player {

    constructor(id, name) {
        this.id = id;
        this.name = name;

        this.hasPlayed = false;

        this.cards = [];
    }

}