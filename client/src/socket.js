import { io } from 'socket.io-client';

const URL = 'http://localhost:3030';
// const URL = 'http://10.204.87.185:3030';

export const socket = io(URL, {
    autoConnect: false
});