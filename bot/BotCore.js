import {ChatClient} from "./chat-client/module.js";

export default class BotCore {
    connected = false;
    currentRoom = null;
    client = null;
    middleware = null;

    constructor(io, server, apiKey) {
        this.client = new ChatClient({host: server,api_key: apiKey}, io);
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
            'after_authenticated': (authData) => {
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
