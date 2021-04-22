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
        let args = msg.content.split(" ").reverse(); args.pop();
        let mainArg = args.pop()

        if(mainArg === "도움말") {
            let embedTosend = new Discord.MessageEmbed();
            embedTosend.setColor(msg.member.displayHexColor);
            embedTosend.setThumbnail(msg.author.avatarURL());
            embedTosend.addField("도움말", "봇 도움말을 출력합니다.");
            embedTosend.addField("코인 [코드]", "[코드]코인을 조회합니다.");

            msg.lineReply(embedTosend);
        }
        else if(mainArg === "코인") {
            let embedTosend = await retrieveCoin(args)
            embedTosend.setColor(msg.member.displayHexColor);
            embedTosend.setThumbnail(msg.author.avatarURL());

            msg.lineReply(embedTosend);
        }
    }
})

client.login(token.token);