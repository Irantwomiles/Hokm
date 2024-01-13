import {useEffect, useState} from 'react'
import {socket} from "./socket.js";
import './App.scss';
import Connection from "./Connection.jsx";
import InfoBar from "./InfoBar.jsx";
import Lobbies from "./Lobbies.jsx";
import Game from "./Game.jsx";

function App() {
    const [lobbies, setLobbies] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [game, setGame] = useState(null);
    const [cards, setCards] = useState([]);

    const handleConnect = () => {
        if(playerName.length === 0) return;
        socket.connect();
    }

    const handleDisconnect = () => {
        socket.disconnect();
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
            console.log(lobbies);
        }

        function updateGameState(game) {
            setGame(game);
            console.log('Updated game:', game);
        }

        function updatePlayerCards(cards) {
            setCards(cards);
            console.log('Updated cards:', cards);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('lobbies', updateLobbies);
        socket.on('create-room-response', updateGameState);
        socket.on('update-game-state', updateGameState);
        socket.on('join-room-response', updateGameState);
        socket.on('update-player-cards', updatePlayerCards);

        return () => {
            handleDisconnect();

            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('lobbies', updateLobbies);
            socket.off('create-room-response', updateGameState);
            socket.off('update-game-state', updateGameState);
            socket.off('join-room-response', updateGameState);
            socket.off('update-player-cards', updatePlayerCards);
        }

    }, []);

    return (
        <>

            {
                isConnected ?

                    <InfoBar
                        playerName={playerName}
                        handleCreateGame={handleCreateGame}
                        handleUpdateLobbies={handleUpdateLobbies}
                    />

                    :
                    <Connection
                        setPlayerName={setPlayerName}
                        handleConnect={handleConnect}
                    />
            }

            <hr />

            {
                game === null ?
                    <Lobbies
                        isConnected={isConnected}
                        lobbies={lobbies}
                        handleJoinGame={handleJoinGame}
                        playerName={playerName}
                    />
                    :
                    <Game
                        game={game}
                        cards={cards}
                        socket={socket}
                    />
            }



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
                            <div>Team One: {game.teamOne.points}</div>
                            <div>
                                <div>Player1</div>
                                <div>ID: {game.teamOne[0] === null ? 'Empty' : game.teamOne[0].id}</div>
                            </div>

                            <div>
                                <div>Player2</div>
                                <div>ID: {game.teamOne[1] === null ? 'Empty' : game.teamOne[1].id}</div>
                            </div>

                        </div>

                        <div>
                            <div>Team Two: {game.teamTwo.points}</div>
                            <div>
                                <div>Player1</div>
                                <div>ID: {game.teamTwo[0] === null ? 'Empty' : game.teamTwo[0].id}</div>
                            </div>

                            <div>
                                <div>Player2</div>
                                <div>ID: {game.teamTwo[1] === null ? 'Empty' : game.teamTwo[1].id}</div>
                            </div>
                        </div>
                    </>

            }

            {
                 <div className={"cards"}>
                    {
                        cards ?
                            cards.filter(c => !c.placed).map((card, index) => (
                                <div className={"card"} key={index}>
                                    <div>{card.suit}</div>
                                    <div>{card.value}</div>
                                    <button onClick={() => socket.emit('place-card', {
                                        gameId: game.id,
                                        playerId: socket.id,
                                        cardId: card.id
                                    })}>Place</button>
                                </div>
                            ))
                            :
                            ''
                    }
                </div>
            }


        </>
    )
}

export default App;