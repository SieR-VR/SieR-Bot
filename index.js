import * as Discord from 'discord.js';
import 'discord-reply';

import { retrieveCoin } from './src/retrieveCoin.js';
import { buyCoin } from './src/buyCoin.js'
import { makeAccount } from './src/makeAccount.js';
import { retrieveAccount } from './src/retrieveAccount.js';
import { enumCoins } from './src/enumCoins.js';
import { help } from './src/help.js';
import { sellCoin } from './src/sellCoin.js';
import { short } from './src/short.js';

import token from './Private/token.json';
import ilegalChannel from './Private/ilegalChannel.json';

const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', async (msg) => {
    if(msg.author.bot) return;

    if(msg.content === "시어") {
        msg.lineReply("무슨 일로 부르셨나요? 도움말은 '시어 도움말'을 통해 확인해주세요.");
        return;
    }

    if(msg.content.startsWith("시어 ")) {
        let args = msg.content.split(" ").reverse(); args.pop();
        let mainArg = args.pop()
        let embedTosend = new Discord.MessageEmbed();
        let isThisChannelIlegal = ilegalChannel.find(element => element.channelID === msg.channel.id);

        if(isThisChannelIlegal !== undefined) {
            embedTosend.setTitle(`오류!`)
            embedTosend.setDescription(`명령어는 <#${isThisChannelIlegal.preferChannelID}> 에 쳐주세요.`)
        }
        else if(mainArg === "도움말") embedTosend = await help(msg, args);
        else if(mainArg === "코인") embedTosend = await retrieveCoin(msg, args);
        else if(mainArg === "매수") embedTosend = await buyCoin(msg, args);
        else if(mainArg === "매도") embedTosend = await sellCoin(msg, args);
        else if(mainArg === "계좌개설") embedTosend = await makeAccount(msg, args);
        else if(mainArg === "계좌") embedTosend = await retrieveAccount(msg, args);
        else if(mainArg === "코인조회") embedTosend = await enumCoins(msg, args);
        else if(mainArg === "숏") embedTosend = await short(msg, args);
        else {
            msg.lineReply(`${mainArg}은(는) 잘못된 명령어에요. 도움말은 '시어 도움말'을 통해 확인해주세요.`);
            return;
        }

        embedTosend.setColor(msg.member.displayHexColor);
        msg.lineReply(embedTosend);
    }
})

client.login(token.token);