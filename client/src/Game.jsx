import * as CardSVG from "./SvgAssets.js";
import {socket} from "./socket.js";

function Game({game, cards, socket}) {

    function getCardPlacedDown(id) {
        const index = game.placementOrder.indexOf(id);
        if(index === -1) {
            console.log("Couldn't find user index, shouldn't happen");
            return '';
        }

        // Player has not placed down a card yet
        if(index > (game.cardsDown.length - 1)) return '';


        return `${game.cardsDown[index].card.suit}${game.cardsDown[index].card.value}`;
    }

    const p1 = game.teamOne[0];
    const p2 = game.teamOne[1];
    const p3 = game.teamTwo[0];
    const p4 = game.teamTwo[1];

    return (
        <>
            <div>
                <h5 className={"mt-2"}>
                    {game.roomName} - ({game.allPlayers.filter(p => p !== null).length}/4 players)
                </h5>

                <hr />

                <div>

                    <div>
                        <div className={"text-center"}>
                            {p1 === null ? 'No one' : `${p1.name}  ${socket.id === p1.id ? ' (You)' : ''}`}
                        </div>

                        <div className={"d-flex"}>

                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                {p3 === null ? 'No one' : `${p3.name}  ${socket.id === p3.id ? ' (You)' : ''}`}
                            </div>

                            <div className={"d-flex flex-grow-1"}>
                                <div className={"d-flex flex-column align-items-center justify-content-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        {p3 === null ?
                                            <></>
                                        :
                                            <img src={CardSVG[getCardPlacedDown(p3.id)]}  alt={"card"}/>
                                        }
                                    </div>
                                </div>

                                <div className={"d-flex flex-column align-items-center flex-grow-1"}>
                                    <div>
                                        <div className={"card-item card-outline"}>
                                            {p1 === null ?
                                                <></>
                                                :
                                                <img src={CardSVG[getCardPlacedDown(p1.id)]}  alt={"card"}/>
                                            }
                                        </div>
                                    </div>

                                    <div className={"py-4"}></div>

                                    <div>
                                        <div className={"card-item card-outline"}>
                                            {p2 === null ?
                                                <></>
                                                :
                                                <img src={CardSVG[getCardPlacedDown(p2.id)]}  alt={"card"}/>
                                            }
                                        </div>
                                    </div>

                                </div>

                                <div className={"d-flex flex-column justify-content-center align-items-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        {p4 === null ?
                                            <></>
                                            :
                                            <img src={CardSVG[getCardPlacedDown(p4.id)]}  alt={"card"}/>
                                        }
                                    </div>
                                </div>

                            </div>


                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                {p4 === null ? 'No one' : `${p4.name} ${socket.id === p4.id ? ' (You)' : ''}`}
                            </div>

                        </div>

                        <div className={"text-center"}>
                            {p2 === null ? 'No one' : `${p2.name} ${socket.id === p2.id ? ' (You)' : ''}`}
                        </div>

                    </div>

                    <h5>Your hand</h5>
                    <div className={"d-flex align-items-center"}>
                    {
                        cards.map((card, index) => (
                            <div key={index} className={`card-item${index === 0 ? '' : ' overlap-margin'}`} onClick={() => socket.emit('place-card', {
                                gameId: game.id,
                                cardId: card.id
                            })}>
                                <img src={CardSVG[`${card.suit}${card.value}`]}  alt={`${card.suit}${card.value}`}/>
                            </div>
                        ))
                    }
                    </div>

                </div>

            </div>
        </>
    )
}

export default Game;