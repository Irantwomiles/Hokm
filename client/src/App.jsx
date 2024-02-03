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
    const [cards, setCards] = useState([
        {
            "id": "08ab2bea-5c47-4c6b-a50e-9cdd825e0b67",
            "suit": "Clover",
            "value": 5,
            "placed": false
        },
        {
            "id": "eafd0de7-4629-403e-9a42-ccca94657e2a",
            "suit": "Hearts",
            "value": 3,
            "placed": false
        },
        {
            "id": "e0c0dd79-7b61-4e1e-ac5d-9f07828e17ca",
            "suit": "Clover",
            "value": 13,
            "placed": false
        },
        {
            "id": "4d65d6f7-1369-4044-b8f9-1d10dc8727a7",
            "suit": "Clover",
            "value": 7,
            "placed": false
        },
        {
            "id": "a409d489-5ee7-4b89-8cc2-d3e81c411f4b",
            "suit": "Hearts",
            "value": 7,
            "placed": false
        },
        {
            "id": "e32d8072-30e7-46e4-9a24-8595d73eb463",
            "suit": "Diamonds",
            "value": 6,
            "placed": false
        },
        {
            "id": "65943f13-303d-4ba9-9ae2-10f808da2b2a",
            "suit": "Clover",
            "value": 11,
            "placed": false
        },
        {
            "id": "040d022c-14ed-4b40-b94c-2af92eee101d",
            "suit": "Spades",
            "value": 14,
            "placed": false
        },
        {
            "id": "204ee1b0-c8da-4830-8ca2-09b876c2b4f0",
            "suit": "Spades",
            "value": 3,
            "placed": false
        },
        {
            "id": "5fc02a29-d29f-4fdf-9d81-504c4e3b5d89",
            "suit": "Hearts",
            "value": 14,
            "placed": false
        },
        {
            "id": "a2ad3192-710b-4164-80df-03e7760aa564",
            "suit": "Hearts",
            "value": 6,
            "placed": false
        },
        {
            "id": "e66c72df-629d-4aa7-a904-79c3c685d0e6",
            "suit": "Clover",
            "value": 9,
            "placed": false
        },
        {
            "id": "bf096164-25ee-46aa-95b5-735af626d5c9",
            "suit": "Spades",
            "value": 8,
            "placed": false
        }
    ]);


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
            socket.emit('get-lobbies');
        }

        function onDisconnect() {
            setIsConnected(false);
            setGame(null);
            setCards([]);
        }

        function updateLobbies(lobbies) {
            setLobbies(lobbies);
        }

        function updateGameState(game) {
            setGame(game);
            console.log('Updated game:', game);
        }

        function updatePlayerCards(cards) {
            setCards(cards);
            console.log('Updated cards:', cards);
        }

        function handleGameEnd() {
            setCards([]);
            setGame(null);

            console.log("Game ended");
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('lobbies', updateLobbies);
        socket.on('create-room-response', updateGameState);
        socket.on('update-game-state', updateGameState);
        socket.on('join-room-response', updateGameState);
        socket.on('update-player-cards', updatePlayerCards);
        socket.on('game-end', handleGameEnd);



        return () => {
            handleDisconnect();

            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('lobbies', updateLobbies);
            socket.off('create-room-response', updateGameState);
            socket.off('update-game-state', updateGameState);
            socket.off('join-room-response', updateGameState);
            socket.off('update-player-cards', updatePlayerCards);
            socket.off('game-end', handleGameEnd);
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
                game === null || socket === null ?
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