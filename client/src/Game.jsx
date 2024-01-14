import * as CardSVG from "./SvgAssets.js";
import Button from "react-bootstrap/Button";

function Game({game, cards, socket}) {

    const p1 = game.teamOne[0];
    const p2 = game.teamOne[1];
    const p3 = game.teamTwo[0];
    const p4 = game.teamTwo[1];

    function getCardPlacedDown(id) {
        const index = game.placementOrder.indexOf(id);
        if(index === -1) {
            console.log("Couldn't find user index, shouldn't happen");
            return '';
        }

        // Player has not placed down a card yet
        if(index > (game.cardsDown.length - 1)) return '';

        return <img src={CardSVG[`${game.cardsDown[index].card.suit}${game.cardsDown[index].card.value}`]}  alt={"card"}/>;
    }

    function getHakemName() {
        for(const p of [p1, p2, p3, p4]) {
            if(p === null) continue;
            if(game.hakem === p.id) {
                return p.name;
            }
        }

        return 'Not yet selected';
    }



    return (
        <>
            <div>

                <div className={"d-flex align-items-center"}>
                    <h5 className={"mt-2"}>
                        {game.roomName} - ({game.allPlayers.filter(p => p !== null).length}/4 players)
                    </h5>

                    <div className={"ms-4"}>
                        <div>The Hakem <i className="fa-solid fa-crown" style={{color: "#f8ce00"}} /> is {getHakemName()} </div>
                    </div>

                    <Button className={"ms-auto"} onClick={() => socket.emit('start-game', {gameId: game.id})}>Start Game</Button>
                </div>

                <hr />

                <div>

                    <div>
                        <div>Your Team : </div>
                        <div>Other </div>
                    </div>

                    <div>
                        <div className={"text-center"}>
                            {p1 === null ? 'Waiting...' :
                            <div>{p1.name}
                                <i className={`fa-solid fa-crown ms-2 ${p1.id === game.hakem ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                <span style={{color: "gray"}}>{socket.id === p1.id ? ' (You)' : ''}</span>
                            </div>}
                        </div>

                        <div className={"d-flex"}>

                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                {p3 === null ? 'Waiting...' :
                                    <div>{p3.name}
                                        <i className={`fa-solid fa-crown ms-2 ${p3.id === game.hakem ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                        <span style={{color: "gray"}}>{socket.id === p3.id ? ' (You)' : ''}</span>
                                    </div>
                                }
                            </div>

                            <div className={"d-flex flex-grow-1"}>
                                <div className={"d-flex flex-column align-items-center justify-content-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        {p3 === null ?
                                            <></>
                                        :
                                            getCardPlacedDown(p3.id)
                                        }
                                    </div>
                                </div>

                                <div className={"d-flex flex-column align-items-center flex-grow-1"}>
                                    <div>
                                        <div className={"card-item card-outline"}>
                                            {p1 === null ?
                                                <></>
                                                :
                                                getCardPlacedDown(p1.id)
                                            }
                                        </div>
                                    </div>

                                    <div className={"py-4"}></div>

                                    <div>
                                        <div className={"card-item card-outline"}>
                                            {p2 === null ?
                                                <></>
                                                :
                                                getCardPlacedDown(p2.id)
                                            }
                                        </div>
                                    </div>

                                </div>

                                <div className={"d-flex flex-column justify-content-center align-items-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        {p4 === null ?
                                            <></>
                                            :
                                            getCardPlacedDown(p4.id)
                                        }
                                    </div>
                                </div>

                            </div>


                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                {p4 === null ? 'Waiting...' :
                                    <div>{p4.name}
                                        <i className={`fa-solid fa-crown ms-2 ${p4.id === game.hakem ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                        <span style={{color: "gray"}}>{socket.id === p4.id ? ' (You)' : ''}</span>
                                    </div>
                                }
                            </div>

                        </div>

                        <div className={"text-center"}>
                            {p2 === null ? 'Waiting...' :
                                <div>{p2.name}
                                    <i className={`fa-solid fa-crown ms-2 ${p2.id === game.hakem ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                    <span style={{color: "gray"}}>{socket.id === p2.id ? ' (You)' : ''}</span>
                                </div>
                            }
                        </div>

                    </div>

                    <h5>Your hand</h5>
                    <div className={"d-flex align-items-center"}>
                    {
                        cards.filter(c => !c.placed).map((card, index) => (
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