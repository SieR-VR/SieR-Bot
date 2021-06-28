import { is } from 'typescript-is';
import { Message, MessageEmbed } from 'discord.js';
import { formatNumber } from './component/Component'
import { fetchMarket, getAllcoinData } from './component/DataManager';
import { coin, upbitResponseFailed } from './component/DataTypes';

const upbitPngUrl = 'https://static.upbit.com/logos/';

export const retrieveCoin = async (msg: Message, args: string[]) => {
    let coinCode = args.pop();
    if(!coinCode) {
        return new MessageEmbed()
            .setTitle("도움말")
            .addField("코인 [코드]", "[코드] 코인을 조회합니다.")
    }
    coinCode = coinCode.toUpperCase();

    if(coinCode === "KRW" || coinCode === "USDT") {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCode} 코인은 조회할 수 없습니다.`)
    }

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    const allCoinData = getAllcoinData();
    const isCoinCodeAvailable = allCoinData.find(element => element.market.includes("-" + coinCode));
    console.log(isCoinCodeAvailable);
    if(isCoinCodeAvailable === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 코인 코드: ${coinCode}`)
    }

    let req: string;
    let market: coin;
    if(allCoinData.find(element => element.market.includes(`KRW-${coinCode}`))) {
        req = `KRW-${coinCode}`;
        market = allCoinData.find(element => element.market.includes(`KRW-${coinCode}`));
    }
    else if(allCoinData.find(element => element.market.includes(`BTC-${coinCode}`))) {
        req = `BTC-${coinCode}`;
        market = allCoinData.find(element => element.market.includes(`BTC-${coinCode}`));
    }
    else {
        req = `USDT-${coinCode}`;
        market = allCoinData.find(element => element.market.includes(`USDT-${coinCode}`));
    }

    const upbitRes = await fetchMarket(req);
    if(!upbitRes) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("네트워크가 불안정합니다.");
    }

    if(is<upbitResponseFailed>(upbitRes)) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(upbitRes.error.message);
    }

    return new MessageEmbed()
        .setTitle(`${market.korean_name} 시세 [${coinCode}]`)
        .addFields([
            {
                name: "현재가",
                value: formatNumber(upbitRes[0].trade_price),
                inline: true
            },
            {
                name: "전일대비", 
                value: `${upbitRes[0].change === 'FALL' ? ":arrow_down_small:" : ":arrow_up_small:"} ${formatNumber(upbitRes[0].change_price)} (${upbitRes[0].change === 'FALL' ? "-" : "+"}${formatNumber(upbitRes[0].change_rate * 100)}%)`,
                inline: true
            }
        ])
        .addField("고가", formatNumber(upbitRes[0].high_price))
        .addFields([
            {
                name: "저가",
                value: formatNumber(upbitRes[0].low_price),
                inline: true
            },
            {
                name: "누적 거래량 (24H)",
                value: formatNumber(upbitRes[0].acc_trade_volume_24h),
                inline: true
            },
            {
                name: "누적 거래대금 (24H)",
                value: formatNumber(upbitRes[0].acc_trade_price_24h),
                inline: true
            }
        ])
        .addField("차트 보기", `[업비트 바로가기](https://upbit.com/exchange?code=CRIX.UPBIT.${market.market})`)
        .setFooter(`최근 거래 일시: ${upbitRes[0].trade_date_kst} ${upbitRes[0].trade_time_kst} KST\n데이터 제공: 업비트`)
        .setThumbnail(`${upbitPngUrl}${coinCode}.png`)
}
