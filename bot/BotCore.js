import {ChatClient} from "sosa-chat-client";
import jwt from 'jsonwebtoken';

export default class BotCore {
    connected = false;
    currentRoom = null;
    client = null;
    middleware = null;

    constructor(io, server, apiKey, botId, botToken, botSecret) {
        this.client = new ChatClient(
            {host: server,api_key: apiKey},
            io,
            {
                get:(callback) => {
                    let packet = {id: botId};
                    let token = jwt.sign(packet, botSecret);
                    callback(token, botToken, true);
                },
                reauth:(callback) => {
                    callback(new Error('Bots shouldn\'t need to reauth'));
                },
                authFailed:() => {
                    console.error('Bot failed to auth', apiKey, botId, botToken, botSecret);
                }
            }
        );
        this.middleware = this.client.middleware;
    }

    sendMessage(communityID, roomID, message){
        this.client.rooms().send(() => {}, communityID, roomID, message);
    }

    joinRoom(communityID, roomID, callback){
        this.client.rooms().join((err, room, userList) => {
            if(err){
               console.debug('Couldn\'t join room', err);
            }else{
                this.currentRoom = room;
            }
            callback(room, userList);

        }, communityID, roomID);
    };

    connect(onAuthenticated, onMessage, onDisconnect){
        this.middleware.clear();
        this.middleware.add({
            'authentication_successful': (authData) => {
                if(typeof onAuthenticated === 'function'){
                    try{
                        authData = onAuthenticated(authData);
                    }catch(e){
                        console.debug('onAuthenticated callback failed', onAuthenticated);
                    }
                }
                return authData;
            },
            'receive_message': (message, client) => {
                if(typeof onMessage === 'function'){
                    try{
                        message = onMessage(message);
                    }catch(e){
                        console.debug('onMessage callback failed', onMessage);
                    }
                }

                return message;
            },
            'disconnect': (message, client) => {
                this.connected = false;
                this.currentRoom = null;

                if(typeof onDisconnect === 'function'){
                    try{
                        message = onDisconnect(message);
                    }catch(e){
                        console.debug('onDisconnect callback failed', onDisconnect);
                    }
                }
                return message;
            }
        });

        this.client.connect();
    }
}
