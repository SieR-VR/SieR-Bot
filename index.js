import * as Discord from 'discord.js';
import 'discord-reply';

import { retrieveCoin } from './src/retrieveCoin.js';

import token from './Private/token.json';

const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', async (msg) => {
    if(msg.author.bot) return;

    if(msg.content.startsWith("시어 ")) {
        let args = msg.content.split(" ").reverse();
        args.pop();

        if(args.pop() === "코인조회") {
            let embedTosend = await retrieveCoin(args)
            embedTosend.setColor(msg.member.displayHexColor);
            embedTosend.setThumbnail(msg.author.avatarURL());
            msg.lineReply(embedTosend);
        }
    }
})

client.login(token.token);