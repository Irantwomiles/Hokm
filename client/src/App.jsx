import {useEffect, useState} from 'react'
import {socket} from "./socket.js";
import './App.css';

function App() {
    const [lobbies, setLobbies] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [game, setGame] = useState(null);

    const handleConnect = () => {
        socket.connect();
    }

    const handleDisconnect = () => {
        socket.disconnect();
        console.log("disconnected");
    }

    const handleUpdateLobbies = () => {
        socket.emit('get-lobbies');
    }

    const handleCreateGame = () => {
        socket.emit('create-room', {
            playerName: playerName
        });
    }

    const handleJoinGame = (roomId, playerName) => {
        socket.emit('join-room', {
            roomId: roomId,
            playerName: playerName
        });
    }

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function updateLobbies(lobbies) {
            setLobbies(lobbies);
        }

        function onCreateRoom(game) {
            setGame(game);
            console.log('create room game:', game);
        }

        function updateGameState(game) {
            setGame(game);
            console.log('Updated game:', game);
        }

        function onJoinRoom(game) {
            console.log('join room game:', game);
            setGame(game);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('lobbies', updateLobbies);
        socket.on('create-room-response', onCreateRoom);
        socket.on('update-game-state', updateGameState);
        socket.on('join-room-response', onJoinRoom);

        return () => {
            handleDisconnect();

            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('lobbies', updateLobbies);
            socket.off('create-room-response', onCreateRoom);
            socket.off('update-game-state', updateGameState);
            socket.off('join-room-response', onJoinRoom);
        }

    }, []);

    return (
        <>
            <div>
                <label>Set Username</label>
                <input onChange={(e) => setPlayerName(e.target.value)} />
            </div>
            <button onClick={handleConnect}>Connect</button>
            <button onClick={handleCreateGame}>Create Game</button>
            <button onClick={handleUpdateLobbies}>Update Lobbies</button>

            <div>
                Lobbies
                {
                    lobbies.map((l, index) => (
                        <div key={index}>
                            <span>{l.value.roomName}</span>
                            <button onClick={() => handleJoinGame(l.id, playerName)}>Join</button>
                        </div>
                    ))
                }
            </div>

            <hr />

            <div>Your ID: {isConnected ? socket.id : 'Not connected'}</div>

            <hr />

            {
                game === null ?
                    <div>Not in a game</div>
                    :
                    <>
                        <div> Game Info: {game.id} {game.gameState}</div>
                        <div> Hakem: {game.hakem === null ? 'Not selected' : game.hakem.id}</div>
                        <div> Hokm: {game.hokm}</div>

                        <button onClick={() => socket.emit('start-game', {gameId: game.id})}>Start Game</button>

                        <hr />

                        <div style={{marginBottom: "1rem"}}>
                            <div>Team One</div>
                            <div>
                                <div>Player1</div>
                                <div>ID: {game.teamOne.playerOne === null ? 'Empty' : game.teamOne.playerOne.id}</div>

                                <div className={"cards"}>
                                    {
                                        game.teamOne.playerOne ?
                                        game.teamOne.playerOne.cards.filter(c => !c.placed).map((card, index) => (
                                            <div className={"card"} key={index}>
                                                <div>{card.suit}</div>
                                                <div>{card.value}</div>
                                            </div>
                                        ))
                                            :
                                            ''
                                    }
                                </div>

                            </div>

                            <div>
                                <div>Player2</div>
                                <div>ID: {game.teamOne.playerTwo === null ? 'Empty' : game.teamOne.playerTwo.id}</div>

                                <div className={"cards"}>
                                {
                                    game.teamOne.playerTwo ?
                                    game.teamOne.playerTwo.cards.filter(c => !c.placed).map((card, index) => (
                                        <div className={"card"} key={index}>
                                            <div>{card.suit}</div>
                                            <div>{card.value}</div>
                                        </div>
                                    ))
                                        :
                                        ''
                                }
                                </div>
                            </div>

                        </div>

                        <div>
                            <div>Team Two</div>
                            <div>
                                <div>Player1</div>
                                <div>ID: {game.teamTwo.playerOne === null ? 'Empty' : game.teamTwo.playerOne.id}</div>
                                <div className={"cards"}>
                                {
                                    game.teamTwo.playerOne ?
                                    game.teamTwo.playerOne.cards.filter(c => !c.placed).map((card, index) => (
                                        <div className={"card"} key={index}>
                                            <div>{card.suit}</div>
                                            <div>{card.value}</div>
                                        </div>
                                    ))
                                        :
                                        ''
                                }
                                </div>
                            </div>

                            <div>
                                <div>Player2</div>
                                <div>ID: {game.teamTwo.playerTwo === null ? 'Empty' : game.teamTwo.playerTwo.id}</div>
                                <div className={"cards"}>
                                {
                                    game.teamTwo.playerTwo ?
                                    game.teamTwo.playerTwo.cards.filter(c => !c.placed).map((card, index) => (
                                        <div className={"card"} key={index}>
                                            <div>{card.suit}</div>
                                            <div>{card.value}</div>
                                        </div>
                                    ))
                                        :
                                        ''
                                }
                                </div>
                            </div>

                        </div>
                    </>

            }


        </>
    )
}

export default App
