import { MessageEmbed } from 'discord.js';
import allCoins from '../allCoin.json';

import fetch from 'node-fetch';
const upbitUrl = 'https://api.upbit.com/v1/ticker';

export const retrieveCoin = async (args) => {
    const coinCode = args.pop();
    if(coinCode === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 적습니다.")
    }

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    const isCoinCodeAvailable = allCoins.find(element => element.market.includes(coinCode));
    console.log(isCoinCodeAvailable);
    if(isCoinCodeAvailable === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 코인 코드: ${coinCode}`)
    }

    console.log(`${upbitUrl}?markets=KRW-${coinCode},BTC-${coinCode},USDT-${coinCode}`);
    const response = await fetch(`${upbitUrl}?markets=KRW-${coinCode},BTC-${coinCode},USDT-${coinCode}`).then(res => res.json());
    
    return new MessageEmbed()
        .setTitle("정상 작동 중")
}