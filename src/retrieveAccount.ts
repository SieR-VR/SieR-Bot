import { is } from 'typescript-is';
import { Message, MessageEmbed } from 'discord.js';
import { formatNumber } from './component/Component'
import { fetchMarket, getAccount, getAllcoinData } from './component/DataManager';
import { upbitResponseSuccess } from './component/DataTypes';

export const retrieveAccount = async (msg: Message, args: string[]) => {
    const account = getAccount(msg.author.id);
    const allCoinData = getAllcoinData();

    if(!account) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("존재하지 않는 사용자입니다. '시어 계좌개설'을 통해 계좌를 만들어주세요.");
    }

    const embedTosend = new MessageEmbed();
    let evalAmount = account.coins.find(coin => coin.coinCode === 'KRW').amount;

    embedTosend.setTitle("계좌 잔액")
    embedTosend.setThumbnail(msg.author.avatarURL())
    for (const coin of account.coins) {
        if(coin.amount !== 0) {
            embedTosend.addField(coin.coinCode, `${formatNumber(coin.amount)}${coin.coinCode}`);
            if(allCoinData.find(coin_ => coin_.market === `KRW-${coin.coinCode}`) !== undefined) {
                const marketData = await fetchMarket(`KRW-${coin.coinCode}`);
                if(is<upbitResponseSuccess>(marketData)) 
                    evalAmount += marketData[0].trade_price * coin.amount;
            }
        }
    };
    embedTosend.addField("총 평가 금액 (KRW)", formatNumber(evalAmount));

    return embedTosend;
}
