import * as CardSVG from "./SvgAssets.js";
import Button from "react-bootstrap/Button";
import {useRef, useState} from "react";

function Game({game, cards, socket}) {

    // const selectedCard = useRef(null);
    const [selectedCard, setSelectedCard] = useState(null);

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

    function hasPlacedCard(player) {
        if(player === null) return false;
        for(const c of game.cardsDown) {
            if(c.playerId === player.id) return true;
        }

        return false;
    }

    function getHakemName() {

        if(game.hakem === null) return <i className="fa-solid fa-circle-notch fa-spin" />;

        for(const p of [p1, p2, p3, p4]) {
            if(p === null) continue;
            if(game.hakem.id === p.id) {
                return p.name;
            }
        }

        return <i className="fa-solid fa-circle-notch fa-spin" />;
    }

    function getHokm() {

        if(game.hokm.length === 0) return <></>;

        switch (game.hokm.toLowerCase()) {
            case 'heart': {
                return <img style={{height: "1.5rem", width: "1.5rem"}} src={CardSVG.HeartSuit} alt={'heart suit'} />
            }
            case 'diamond': {
                return <img style={{height: "1.5rem", width: "1.5rem"}}  src={CardSVG.DiamondSuit} alt={'diamond suit'} />
            }
            case 'clover': {
                return <img style={{height: "1.5rem", width: "1.5rem"}}  src={CardSVG.CloverSuit} alt={'clover suit'} />
            }
            case 'spade': {
                return <img style={{height: "1.5rem", width: "1.5rem"}}  src={CardSVG.SpadeSuit} alt={'spade suit'} />
            }
            default:
                return  <></>;
        }
    }

    function getPlacementTurn(player) {

        if(player === null) {
            console.log("player null");
            return '';
        }

        if(game.gameState !== 'PLACE_CARD') return '';

        if(game.placementOrder[game.placementTurn] === player.id) return 'pulse-blue';

        return '';
    }

    function getPlayerTeam(id) {
        for(const p of [p1, p2]) {
            if(p === null) continue;
            if(p.id === id) return 'TEAM_ONE';
        }

        for(const p of [p3, p4]) {
            if(p === null) continue;
            if(p.id === id) return 'TEAM_TWO';
        }

        return 'UNKNOWN';
    }

    function handlePlaceCard(event, gameId, cardId) {
        event.stopPropagation();

        // only do the double click selection if the window is below the pixel threshold
        if(window.innerWidth <= 769) {
            if(selectedCard === null) {
                setSelectedCard({
                    gameId,
                    cardId
                })
                return;
            }

            if(selectedCard.gameId !== gameId || selectedCard.cardId !== cardId) {
                setSelectedCard({
                    gameId,
                    cardId
                })
                return;
            }

            socket.emit('place-card', {
                gameId,
                cardId
            });

            setSelectedCard(null);
            return;
        }

        socket.emit('place-card', {
            gameId,
            cardId
        });

    }

    function renderTeamScores(game, socketId) {

        if(!game) return <></>

        const playerTeam = getPlayerTeam(socketId) === 'TEAM_ONE' ? game.teamOneHands : game.teamTwoHands;
        const otherTeam = getPlayerTeam(socketId) === 'TEAM_ONE' ? game.teamTwoHands : game.teamOneHands;
        return (
            <>
                <div className={"hands-won mb-2"}>
                    {
                        Array(playerTeam).fill(0).map((v, index) => (
                            <img key={index} src={CardSVG['BlueBack']}  alt={'blue card back'}/>
                        ))
                    }
                </div>

                <div className={"hands-won"}>
                    {
                        Array(otherTeam).fill(0).map((v, index) => (
                            <img key={index} src={CardSVG['RedBack']}  alt={'red card back'}/>
                        ))
                    }
                </div>
            </>
            )

    }

    return (
        <>

            {game === null ? '' :

            <div>

                <div className={"d-flex align-items-center"}>
                    <h5 className={"mt-2"}>
                        {game.roomName} - ({game.allPlayers.filter(p => p !== null).length}/4 players)
                    </h5>

                    <Button className={`ms-auto ${game.teamOne[0].id !== socket.id ? 'd-none' : ''} ${game.gameState !== 'WAITING' ? 'd-none' : ''}`} onClick={() => socket.emit('start-game', {gameId: game.id})}>Start Game</Button>
                </div>

                <hr />

                <div className={"board p-2"} onClick={() => {
                    setSelectedCard(null);
                }}>

                    <div className={"d-flex align-items-center p-2 mb-2"} style={{backgroundColor: "#1f7c1d", borderRadius: "0.5rem"}}>
                        <div>
                            {renderTeamScores(game, socket.id)}
                        </div>

                        <div className={"game-info"}>
                            <div className={"ms-auto"}>
                                <div>Hakem <i className="fa-solid fa-crown" style={{color: "#f8ce00"}} /> {getHakemName()} </div>
                            </div>

                            <div className={"ms-4"}>
                                <div>{getHokm()}</div>
                            </div>
                        </div>

                    </div>

                    <div>
                        <div className={"text-center d-none-md-down"}>
                            {p1 === null ? 'Waiting...' :
                            <div>{p1.name}
                                {
                                    game.hakem === null ?
                                        ''
                                        :
                                        <i className={`fa-solid fa-crown ms-2 ${p1.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                }
                                <span style={{color: "gray"}}>{socket.id === p1.id ? ' (You)' : ''}</span>
                            </div>}
                        </div>

                        <div className={"d-flex"}>

                            <div className={"d-flex flex-column justify-content-center align-items-center d-none-md-down"}>
                                {p3 === null ? 'Waiting...' :
                                    <div>{p3.name}
                                        {
                                            game.hakem === null ?
                                                ''
                                                :
                                                <i className={`fa-solid fa-crown ms-2 ${p3.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                        }
                                        <span style={{color: "gray"}}>{socket.id === p3.id ? ' (You)' : ''}</span>
                                    </div>
                                }
                            </div>

                            <div className={"d-flex flex-grow-1"}>
                                <div className={"d-flex flex-column align-items-center justify-content-center flex-grow-1"}>
                                    <div className={`card-item d-flex align-items-center justify-content-center ${hasPlacedCard(p3) ? '' : 'card-outline'} ${getPlacementTurn(p3)}`}>
                                        {p3 === null ?
                                            <></>
                                        :
                                            getCardPlacedDown(p3.id)
                                        }

                                        {p3 === null ? <span className={"d-none-md-up"}>Waiting...</span> :
                                            <div className={"d-none-md-up"} style={{overflow: "hidden", maxWidth: "4.5rem"}}>
                                                <div className={"card-user-info text-center"}>{p3.name}</div>
                                                {
                                                    game.hakem === null ?
                                                        ''
                                                        :
                                                        <div className={"text-center"}>
                                                            <i className={`fa-solid fa-crown ${p3.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                                        </div>
                                                }
                                                <div className={"text-center"} style={{color: "gray", fontSize: "0.85rem"}}>{socket.id === p3.id ? ' (You)' : ''}</div>
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className={"d-flex flex-column align-items-center flex-grow-1"}>
                                    <div>
                                        <div className={`card-item d-flex align-items-center justify-content-center ${hasPlacedCard(p1) ? '' : 'card-outline'} ${getPlacementTurn(p1)}`}>
                                            {p1 === null ?
                                                <></>
                                                :
                                                getCardPlacedDown(p1.id)
                                            }

                                            {p1 === null ? <span className={"d-none-md-up"}>Waiting...</span> :
                                                <div className={"d-none-md-up"} style={{overflow: "hidden", maxWidth: "4.5rem"}}>
                                                    <div className={"card-user-info text-center"}>{p1.name}</div>
                                                    {
                                                        game.hakem === null ?
                                                            ''
                                                            :
                                                            <div className={"text-center"}>
                                                                <i className={`fa-solid fa-crown ${p1.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                                            </div>
                                                    }
                                                    <div className={"text-center"} style={{color: "gray", fontSize: "0.85rem"}}>{socket.id === p1.id ? ' (You)' : ''}</div>
                                                </div>
                                            }

                                        </div>
                                    </div>

                                    <div className={"py-4"}></div>

                                    <div>
                                        <div className={`card-item d-flex align-items-center justify-content-center ${hasPlacedCard(p2) ? '' : 'card-outline'} ${getPlacementTurn(p2)}`}>
                                            {p2 === null ?
                                                <></>
                                                :
                                                getCardPlacedDown(p2.id)
                                            }

                                            {p2 === null ? <span className={"d-none-md-up"}>Waiting...</span> :
                                                <div className={"d-none-md-up"} style={{overflow: "hidden", maxWidth: "4.5rem"}}>
                                                    <div className={"card-user-info text-center"}>{p2.name}</div>
                                                    {
                                                        game.hakem === null ?
                                                            ''
                                                            :
                                                            <div className={"text-center"}>
                                                                <i className={`fa-solid fa-crown ${p2.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                                            </div>
                                                    }
                                                    <div className={"text-center"} style={{color: "gray", fontSize: "0.85rem"}}>{socket.id === p2.id ? ' (You)' : ''}</div>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                </div>

                                <div className={"d-flex flex-column justify-content-center align-items-center flex-grow-1"}>
                                    <div className={`card-item d-flex align-items-center justify-content-center ${hasPlacedCard(p4) ? '' : 'card-outline'} ${getPlacementTurn(p4)}`}>
                                        {p4 === null ?
                                            <></>
                                            :
                                            getCardPlacedDown(p4.id)
                                        }

                                        {p4 === null ? <span className={"d-none-md-up"}>Waiting...</span> :
                                            <div className={"d-none-md-up"} style={{overflow: "hidden", maxWidth: "4.5rem"}}>
                                                <div className={"card-user-info text-center"}>{p4.name}</div>
                                                {
                                                    game.hakem === null ?
                                                        ''
                                                        :
                                                        <div className={"text-center"}>
                                                            <i className={`fa-solid fa-crown ${p4.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                                        </div>
                                                }
                                                <div className={"text-center"} style={{color: "gray", fontSize: "0.85rem"}}>{socket.id === p4.id ? ' (You)' : ''}</div>
                                            </div>
                                        }
                                    </div>
                                </div>

                            </div>


                            <div className={"d-flex flex-column justify-content-center align-items-center d-none-md-down"}>
                                {p4 === null ? 'Waiting...' :
                                    <div>{p4.name}
                                        {
                                            game.hakem === null ?
                                                ''
                                                :
                                                <i className={`fa-solid fa-crown ms-2 ${p4.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                        }
                                        <span style={{color: "gray"}}>{socket.id === p4.id ? ' (You)' : ''}</span>
                                    </div>
                                }
                            </div>

                        </div>

                        <div className={"text-center d-none-md-down"}>
                            {p2 === null ? 'Waiting...' :
                                <div>{p2.name}
                                    {
                                        game.hakem === null ?
                                            ''
                                            :
                                            <i className={`fa-solid fa-crown ms-2 ${p2.id === game.hakem.id ? '' : 'd-none'}`} style={{color: "#f8ce00"}} />
                                    }
                                    <span style={{color: "gray"}}>{socket.id === p2.id ? ' (You)' : ''}</span>
                                </div>
                            }
                        </div>

                    </div>

                    <h5>Your hand</h5>
                    <div className={"d-flex align-items-center flex-wrap"}>

                    {
                        game.gameState === 'PICK_HOKM' ?
                            cards.map((card, index) => (
                                <div key={index} className={`card-item${index === 0 ? '' : ' overlap-margin'}`} onClick={() => socket.emit('select-hokm', {
                                    suit: card.suit
                                })}>
                                    <img src={CardSVG[`${card.suit}${card.value}`]}  alt={`${card.suit}${card.value}`}/>
                                </div>
                            ))
                            :
                            cards.filter(c => !c.placed).map((card, index) => (
                                <div key={index} className={`card-item${index === 0 ? '' : ' overlap-margin'} `} onClick={(e) => handlePlaceCard(e, game.id, card.id)}>
                                    <img className={`${selectedCard !== null && selectedCard.cardId === card.id ? 'selected-card pulse-blue' : ''}`} src={CardSVG[`${card.suit}${card.value}`]}  alt={`${card.suit}${card.value}`}/>
                                </div>
                            ))
                    }


                    </div>

                </div>

            </div>
            }
        </>
    )
}


export default Game;