import * as Discord from 'discord.js';

import { retrieveCoin } from './src/retrieveCoin';
import { buyCoin } from './src/buyCoin'
import { makeAccount } from './src/makeAccount';
import { retrieveAccount } from './src/retrieveAccount';
import { enumCoins } from './src/enumCoins';
import { help } from './src/help';
import { sellCoin } from './src/sellCoin';
import { short } from './src/short';
import { checkIlegalChannel, getToken } from './src/component/DataManager';

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', async (msg: Discord.Message) => {
    if(msg.author.bot) return;
    if(checkIlegalChannel(msg)) return;

    if(msg.content === "시어") {
        msg.reply("무슨 일로 부르셨나요? 도움말은 '시어 도움말'을 통해 확인해주세요.");
        return;
    }

    if(msg.content.startsWith("시어 ")) {
        let args = msg.content.split(" ").reverse(); args.pop();
        let mainArg = args.pop()
        let embedTosend = new Discord.MessageEmbed();

        if(mainArg === "도움말") embedTosend = await help(msg, args);
        else if(mainArg === "코인") embedTosend = await retrieveCoin(msg, args);
        else if(mainArg === "매수") embedTosend = await buyCoin(msg, args);
        else if(mainArg === "매도") embedTosend = await sellCoin(msg, args);
        else if(mainArg === "계좌개설") embedTosend = await makeAccount(msg, args);
        else if(mainArg === "계좌") embedTosend = await retrieveAccount(msg, args);
        else if(mainArg === "코인조회") embedTosend = await enumCoins(msg, args);
        else if(mainArg === "숏") embedTosend = await short(msg, args);
        else {
            msg.reply(`${mainArg}은(는) 잘못된 명령어에요. 도움말은 '시어 도움말'을 통해 확인해주세요.`);
            return;
        }

        embedTosend.setColor(msg.member.displayHexColor);
        msg.reply(embedTosend);
    }
})

client.login(getToken());