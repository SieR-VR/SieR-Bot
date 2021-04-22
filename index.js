import * as Discord from 'discord.js';
import 'discord-reply';

import { retrieveCoin } from './src/retrieveCoin.js';
import { buyCoin } from './src/buyCoin.js'
import { makeAccount } from './src/makeAccount.js';
import { retrieveAccount } from './src/retrieveAccount.js';

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
        else if(mainArg === "도움말") {
            embedTosend.setTitle("도움말")
            embedTosend.addField("도움말", "봇 도움말을 출력합니다.");
            embedTosend.addField("코인 [코드]", "[코드]코인을 조회합니다.");
            embedTosend.addField("계좌개설", "계좌를 개설합니다. 초기 금액은 1,000,000KRW입니다.")
            embedTosend.addField("매수 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 매수합니다.")
            embedTosend.setThumbnail(msg.author.avatarURL());
        }
        else if(mainArg === "코인") {
            embedTosend = await retrieveCoin(args);
        }
        else if(mainArg === "매수") {
            embedTosend = await buyCoin(msg, args);
        }
        else if(mainArg === "계좌개설") {
            embedTosend = await makeAccount(msg, args);
        }
        else if(mainArg === "계좌") {
            embedTosend = await retrieveAccount(msg, args);
        }
        else {
            msg.lineReply(`${mainArg}은(는) 잘못된 명령어에요. 도움말은 '시어 도움말'을 통해 확인해주세요.`);
            return;
        }

        embedTosend.setColor(msg.member.displayHexColor);
        msg.lineReply(embedTosend);
    }
})

client.login(token.token);