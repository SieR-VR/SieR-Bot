import { MessageEmbed } from 'discord.js';
import * as fs from 'fs';
import { formatNumber } from './component/component.js'

const fileName = './Private/userData.json'

export const retrieveAccount = async (msg, args) => {
    let accounts = fs.readFileSync(fileName, 'utf8')
    accounts = JSON.parse(accounts);
    let account = accounts.accounts.find(element => element.id === msg.author.id);

    if(account === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("존재하지 않는 사용자입니다. '시어 계좌개설'을 통해 계좌를 만들어주세요.");
    }

    let embedTosend = new MessageEmbed();
    embedTosend.setTitle("계좌 잔액")
    embedTosend.setThumbnail(msg.author.avatarURL())
    account.coins.forEach(coin => {
        if(coin.amount !== 0) embedTosend.addField(coin.coinCode, `${formatNumber(coin.amount)}${coin.coinCode}`);
    });

    return embedTosend;
}
