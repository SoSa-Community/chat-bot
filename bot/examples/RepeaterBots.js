'use strict';

import io from 'socket.io-client';

import { SoSaConfig } from "../config.js";
import BotCore from "../BotCore.js";
import bslite3 from 'better-sqlite3';

let usernames = [
    'Cobrass',
    'Dwarvos',
    'Womblast',
    'Badept',
    'RoadMachine',
    'ComplexBoar',
    'HopeNinja',
    'RapidEnigma',
    'AuntMango',
    'MagicFly',
    'Gamerman',
    'Nitrogue',
    'Binghost',
    'Recyclops',
    'GhostSparrow',
    'ChillRanger',
    'LandVanilla',
    'BouncyPhoenix',
    'BubbleKraken',
    'HappyMinotaur',
    'Cobrag',
    'Llamaths',
    'Chimpanther',
    'Marauderby',
    'SneakyLeopard',
    'BeautifulCranberry',
    'SelfishPapaya',
    'BalloonWalker',
    'EmbarrasedCrusader',
    'AwkwardSkunk',
    'Sparasite',
    'Mosquitoxic',
    'Froghurt',
    'Slotherworldly',
    'RhythmOrangutan',
    'SoftSlider',
    'SmallPhantasm',
    'CruelLocust',
    'ArcticBloodElf',
    'ThunderSuccubus',
    'Grapeshifter',
    'Wolfire',
    'Eyewearwolf',
    'Gobling',
    'FarmFawn',
    'ImpossibleDrake',
    'AdviseSnake',
    'FantasticOx',
    'RespectShifter',
    'MusicalProphet',
    'Ocelotus',
    'Knightmare',
    'GiantPandamonium',
    'Llamaths',
    'QuirkySparkle',
    'SmugDessert',
    'SmallHummingbird',
    'PoisonHopper',
    'CovertMaggot',
    'LiquidKraken'
];

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const databasePath = `${dirname(fileURLToPath(import.meta.url))}/message_database.db`;

try {
    if (!fs.existsSync(databasePath)) {
        console.error('Please rename `message_database_example.db` to `message_database.db` and add your data');
        process.exit();
    }
} catch(err) {
    console.error(err);
    process.exit();
}

let db = new bslite3(databasePath);
let messages = db.prepare('select * from messages').all();

let bots = {};

let handleMessage = (index) => {};

let randomUsername = () => {
    return usernames[Math.floor(Math.random()*usernames.length)];
};

handleMessage = (index) => {
    if(messages[index]){
        let row = messages[index];

        let sendMessage = () => {
            bots[row.nickname].sendMessage('sosa', 'general', row.message.replace(/@[A-Z]+/,`@${randomUsername(true)}`));

            if(messages[index + 1]){
                let nextRow = messages[index + 1];
                let timeout = Math.round((nextRow.timestamp - row.timestamp) * 1000);
                if(timeout < 0) timeout = 0;

                console.log(`Waiting ${timeout / 1000} seconds`);

                setTimeout(() => {
                    handleMessage(index + 1);
                }, timeout);
            }
        };

        let joinRoom = () => {
            if(bots[row.nickname].currentRoom === null){
                bots[row.nickname].joinRoom('sosa','general', (room, userList) => {
                    if(room){
                        console.debug(`Joined room ${room.name}`);
                        sendMessage();
                    }
                });
            }else{
                sendMessage();
            }
        };

        if(!bots[row.nickname]){
            bots[row.nickname] = new BotCore(io, SoSaConfig.chat.server, SoSaConfig.chat.api_key);

            let onAuthenticated = (authData) => joinRoom();
            bots[row.nickname].connect(onAuthenticated);
        }else{
            sendMessage();
        }
    }
};
handleMessage(0);
