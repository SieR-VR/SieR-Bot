import { MessageEmbed, Message } from 'discord.js';
import { addUser } from './component/DataManager';

const startMoney = 1000000;

export const makeAccount = async (msg: Message, args: string[]) => {
    if(args.pop() !== undefined) 
    {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("계좌 개설에는 인수가 필요하지 않습니다.")
    }

    const success = addUser(msg.author.id, startMoney);

    if(!success) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("이미 존재하는 사용자입니다.")
    }

    return new MessageEmbed()
        .setTitle("계좌 개설 성공")
        .setDescription(`성공적으로 ${msg.author.username}님의 계좌를 개설했습니다.`)
        .setThumbnail(msg.author.avatarURL());
}