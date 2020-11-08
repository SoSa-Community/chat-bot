import {Client} from "sosa-chat-client";
import jwt from 'jsonwebtoken';

export default class BotCore {
    connected = false;
    currentRoom = null;
    client = null;
    middleware = null;
    device = {id:'', secret:'', name:'', platform:'bot', pushService:'', isBot: true, botId: 0};
    session = {};
    chatService = null;

    constructor(io, config, botId, botToken, botSecret) {
        this.device.botId = botId;
        this.device.id = botToken;
        this.device.secret = botSecret;
        
        const client = new Client(
            config,
            io,
            null,
            {
                getDevice: () => new Promise(resolve => resolve(this.device)),
                updateDevice: (device) => new Promise((resolve, reject) => {
                    this.device = device;
                    resolve(device);
                }),
                getSession: () => new Promise(resolve => resolve(this.session)),
                updateSession: (session) => new Promise((resolve, reject) => {
                    this.session = session;
                    resolve(session);
                }),
                generateJWT: (packet) => {
                    if(!this.device.secret) throw new Error('Device not initialized');
                    return jwt.sign(packet, this.device.secret);
                },
                reauth: () => {throw new Error('Bots shouldn\'t need to reauth')},
                authFailed: () => {
                    console.error('Bot failed to auth', apiKey, botId, botToken, botSecret);
                }
            }
        );
        this.chatService = client.services.chat;
        this.middleware = client.middleware;
        this.client = client;
    }

    sendMessage(communityID, roomID, message){
        const { chatService: { rooms } } = this;
        return rooms.send(communityID, roomID, message);
    }

    joinRoom(communityID, roomID){
        const { chatService: { rooms } } = this;
        
        return rooms.join(communityID, roomID)
            .then(({room, userList}) => {
                this.currentRoom = room;
                return {room, userList};
            })
            .catch((error) => console.debug(`Couldn't join room`, error));
        
    };

    connect(onAuthenticated, onMessage, onDisconnect){
        const namespace = `bot-${this.device.botId}`;
        const { middleware } = this;
        middleware.clear(namespace);
        middleware.add(namespace, {
            'authentication_successful': (authData) => {
                if(typeof onAuthenticated === 'function'){
                    try{
                        onAuthenticated(authData);
                    }catch(e){
                        console.debug('onAuthenticated callback failed', onAuthenticated);
                    }
                }
                return authData;
            },
            'event' : (packet) => {
                const { type, data } = packet;
                if(type === 'chat/message') {
                    if(typeof onMessage === 'function') {
                        try{
                            return onMessage(data);
                        }catch (e) {
                            console.debug('onMessage callback failed', onMessage);
                        }
                    }
                }
                return packet;
            },
            'disconnect': (reason) => {
                this.connected = false;
                this.currentRoom = null;

                if(typeof onDisconnect === 'function'){
                    try{
                        return onDisconnect(reason);
                    }catch(e){
                        console.debug('onDisconnect callback failed', onDisconnect);
                    }
                }
                return reason;
            }
        });
    }
}
