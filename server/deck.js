import {v4 as uuid} from "uuid";

export default class Deck {
    constructor() {

        const suits = ['HEART', 'SPADE', 'CLOVER', 'DIAMOND'];
        this.cards = [];

        for(const suit of suits) {
            this.cards.push(
                ...[
                    new Card(suit, 14),
                    new Card(suit, 2),
                    new Card(suit, 3),
                    new Card(suit, 4),
                    new Card(suit, 5),
                    new Card(suit, 6),
                    new Card(suit, 7),
                    new Card(suit, 8),
                    new Card(suit, 9),
                    new Card(suit, 10),
                    new Card(suit, 11),
                    new Card(suit, 12),
                    new Card(suit, 13)
                ]
            )
        }
    }

    shuffle() {
        this.cards.sort( () => Math.random() - 0.5);
    }
}

class Card {
    // Suits: Heart, Spade, Clover, Diamond
    // Values: 14(A), 2, 3, 4, 5, 6, 7, 8, 9, 10, 11(J), 12(Q), 13(K)
    constructor(suit, value) {
        this.id = uuid();
        this.suit = suit;
        this.value = value;
        this.placed = false;
    }
}