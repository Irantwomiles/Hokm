import {useEffect, useState} from 'react'
import {socket} from "./socket.js";
import './App.scss';
import Connection from "./Connection.jsx";
import InfoBar from "./InfoBar.jsx";
import Lobbies from "./Lobbies.jsx";
import Game from "./Game.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
            setGame(null);
            setCards([]);
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

        </>
    )
}

export default App;