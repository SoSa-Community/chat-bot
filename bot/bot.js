'use strict';

const __filename = import.meta.url;
const __dirname = new URL(import.meta.url).pathname;

import io from 'socket.io-client';

import { SoSaConfig } from "./config.js";
import {ChatClient, Message, MessageParser} from './chat-client/module.js';

console.debug(io);


let client = new ChatClient({
    host: SoSaConfig.chat.server,
    api_key: SoSaConfig.chat.api_key
}, io);

let middleware = client.middleware;

middleware.clear();

let currentRoom = null;

function sendMessage(message){
    client.rooms().send(() => {}, currentRoom.community_id, currentRoom.name, message);
}

function joinRoom(communityID, roomID, callback){

    client.rooms().join((err, room, userList) => {
        if(err){
            console.debug('Couldn\'t join room',err);
        }else{
            currentRoom = room;
            console.debug(`Joined room ${room.name}`);
            sendMessage('hello james');

        }

    }, communityID, roomID);
};

middleware.add({
    'receive_message': (message, client) => {

        return message;
    },
    'after_authenticated': (authData, client) => {
        joinRoom('sosa', 'general');

        return authData;
    },
    'disconnect': (message, client) => {
        return message;
    }
});

client.connect();
