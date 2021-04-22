import { MessageEmbed } from 'discord.js';
import { formatNumber } from './component/component.js'
import fetch from 'node-fetch';
import * as fs from 'fs';

import allCoins from '../allCoin.json';

const upbitUrl = 'https://api.upbit.com/v1/ticker';
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
    let evalAmount = account.coins.find(coin => coin.coinCode === 'KRW').amount;
    embedTosend.setTitle("계좌 잔액")
    embedTosend.setThumbnail(msg.author.avatarURL())
    for (const coin of account.coins) {
        if(coin.amount !== 0) {
            embedTosend.addField(coin.coinCode, `${formatNumber(coin.amount)}${coin.coinCode}`);
            if(allCoins.find(coin_ => coin_.market === `KRW-${coin.coinCode}`) !== undefined) {
                let res = await fetch(`${upbitUrl}?markets=KRW-${coin.coinCode}`).then(async res => res.json());
                evalAmount += res[0].trade_price * coin.amount;
            }
        }
    };
    embedTosend.addField("총 평가 금액 (KRW)", formatNumber(evalAmount));

    return embedTosend;
}
