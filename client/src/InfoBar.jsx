import Button from "react-bootstrap/Button";

function InfoBar({playerName, handleCreateGame, handleUpdateLobbies}) {
    return (
        <>
            <div className={"mt-2 d-flex align-items-center justify-content-between"}>
                <h3 className={"mt-2"}>
                    Welcome, <span style={{color: "#612283"}}>{playerName}</span>
                </h3>

                <div>
                    <Button className={"me-2"} variant={"one"} onClick={handleCreateGame}>Create Game</Button>
                    <Button onClick={handleUpdateLobbies}>Refresh Lobbies</Button>
                </div>
            </div>
        </>
    )
}

export default InfoBar;