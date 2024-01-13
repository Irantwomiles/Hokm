import * as CardSVG from "./SvgAssets.js";

function Game({game}) {
    return (
        <>
            <div>
                <h5 className={"mt-2"}>
                    {/*{game.roomName} - ({game.allPlayers.filter(p => p !== null).length}/4 players)*/}
                </h5>

                <hr />

                <div>

                    <div>
                        <div className={"text-center"}>
                            Player top
                        </div>

                        <div className={"d-flex"}>

                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                Player left
                            </div>

                            <div className={"d-flex flex-grow-1"}>
                                <div className={"d-flex flex-column align-items-center justify-content-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        <img src={CardSVG.Clubs11}  alt={"card"}/>
                                    </div>
                                </div>

                                <div className={"d-flex flex-column align-items-center flex-grow-1"}>
                                    <div>
                                        <div className={"card-item card-outline"}>
                                            <img src={CardSVG.Diamonds9}  alt={"card"}/>
                                        </div>
                                    </div>

                                    <div className={"py-4"}></div>

                                    <div>
                                        <div className={"card-item card-outline"}>
                                            <img src={CardSVG.ClubsThree}  alt={"card"}/>
                                        </div>
                                    </div>

                                </div>

                                <div className={"d-flex flex-column justify-content-center align-items-center flex-grow-1"}>
                                    <div className={"card-item card-outline"}>
                                        <img src={CardSVG.Spades14}  alt={"card"}/>
                                    </div>
                                </div>

                            </div>


                            <div className={"d-flex flex-column justify-content-center align-items-center"}>
                                Player right
                            </div>

                        </div>

                        <div className={"text-center"}>
                            Player bottom
                        </div>

                    </div>


                </div>

            </div>
        </>
    )
}

export default Game;