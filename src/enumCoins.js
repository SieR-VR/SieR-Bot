import { MessageEmbed } from 'discord.js';
import allCoins from '../allCoin.json';

export const enumCoins = async (msg, args) => {
    let length = Number(args.pop());

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    let lengthCoins = allCoins.slice(0, length > allCoins.length ? allCoins.length : length);
    let coins = [];

    lengthCoins.forEach(coin => {
        coins.push({
            coinCode: coin.market.split("-")[1],
            koreanName: coin.korean_name
        })
    })

    let coinSet = [];
    coins.filter((value) => {
        let i = coinSet.findIndex(x => (x.coinCode == value.coinCode));
        if(i <= -1) coinSet.push(value);
    });

    let embedTosend = new MessageEmbed();
    embedTosend.setTitle("코인 목록");
    embedTosend.setThumbnail(msg.author.avatarURL());

    coinSet.forEach(coin => {
        embedTosend.addField(coin.coinCode, coin.koreanName, true);
    })

    return embedTosend;
}