import Button from "react-bootstrap/Button";

function Lobbies({lobbies, isConnected, handleJoinGame, playerName}) {
    return (
        <>
            <div>
                <h5 className={"mt-2"}>
                    Current Games ({lobbies.length})
                </h5>

                {
                    lobbies.map((l, index) => (
                        <div className={"lobby d-flex align-items-center justify-content-between mb-2 px-4 py-2"} key={index}>
                            <div>
                                {l.value.roomName} - ({l.value.allPlayers.filter(p => p !== null).length}/4 players) - {l.value.gameState}
                            </div>
                            <Button variant={"outline-secondary"} onClick={() => handleJoinGame(l.id, playerName)}>Join</Button>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default Lobbies;