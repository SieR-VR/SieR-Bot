import { MessageEmbed, Message } from 'discord.js';
import { getAllcoinData } from './component/DataManager'

export const enumCoins = async (msg: Message, args: string[]) => {
    const length = Number(args.pop());

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    const allCoinData = getAllcoinData();
    const lengthCoins = allCoinData.slice(0, length > allCoinData.length ? allCoinData.length : length);
    const coins = [];

    lengthCoins.forEach(coin => {
        coins.push({
            coinCode: coin.market.split("-")[1],
            koreanName: coin.korean_name
        })
    })

    const coinSet = [];
    coins.filter((value) => {
        let i = coinSet.findIndex(x => (x.coinCode == value.coinCode));
        if(i <= -1) coinSet.push(value);
    });

    const embedTosend = new MessageEmbed();
    embedTosend.setTitle("코인 목록");
    embedTosend.setThumbnail(msg.author.avatarURL());

    coinSet.forEach(coin => {
        embedTosend.addField(coin.coinCode, coin.koreanName, true);
    })

    return embedTosend;
}