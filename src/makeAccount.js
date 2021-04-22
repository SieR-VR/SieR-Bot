import { MessageEmbed } from 'discord.js';
import * as fs from 'fs';

const fileName = './Private/userData.json'
const startMoney = 1000000;

export const makeAccount = async (msg, args) => {
    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("계좌 개설에는 인수가 필요하지 않습니다.")
    }

    let accounts = fs.readFileSync(fileName, 'utf8')
    accounts = JSON.parse(accounts);

    let isAccountAlreadyExist = accounts.accounts.find(element => element.id === msg.author.id);
    if(isAccountAlreadyExist !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("이미 존재하는 사용자입니다.")
    }

    accounts.sumOfGivenMoney += startMoney;
    accounts.accounts.push({
        id: msg.author.id,
        coins: [
            {
                coinCode: "KRW",
                amount: 1000000
            }
        ]
    })

    fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2))

    return new MessageEmbed()
        .setTitle("계좌 개설 성공")
        .setDescription(`성공적으로 ${msg.author.username}님의 계좌를 개설했습니다.`)
}