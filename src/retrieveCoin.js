import { MessageEmbed } from 'discord.js';
import allCoins from '../allCoin.json';

import fetch from 'node-fetch';
const upbitUrl = 'https://api.upbit.com/v1/ticker';

export const retrieveCoin = async (args) => {
    let coinCode = args.pop();
    if(coinCode === undefined) {
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

    const isCoinCodeAvailable = allCoins.find(element => element.market.includes("-" + coinCode));
    console.log(isCoinCodeAvailable);
    if(isCoinCodeAvailable === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 코인 코드: ${coinCode}`)
    }

    let req = '';
    let market;
    if(allCoins.find(element => element.market.includes(`KRW-${coinCode}`))) {
        req = `${upbitUrl}?markets=KRW-${coinCode}`;
        market = allCoins.find(element => element.market.includes(`KRW-${coinCode}`));
    }
    else if(allCoins.find(element => element.market.includes(`BTC-${coinCode}`))) {
        req = `${upbitUrl}?markets=BTC-${coinCode}`;
        market = allCoins.find(element => element.market.includes(`BTC-${coinCode}`));
    }
    else {
        req = `${upbitUrl}?markets=USDT-${coinCode}`;
        market = allCoins.find(element => element.market.includes(`USDT-${coinCode}`));
    }

    const res = await fetch(req).then(res => res.json());

    return new MessageEmbed()
        .setTitle(`${market.korean_name} 시세 [${coinCode}]`)
        .addFields([
            {
                name: "현재가",
                value: res[0].trade_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ","),
                inline: true
            },
            {
                name: "전일대비", 
                value: `${res[0].change === 'FALL' ? ":arrow_down_small:" : ":arrow_up_small:"} ${res[0].change_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ",")} (${res[0].change === 'FALL' ? "-" : "+"}${res[0].change_rate * 100}%)`,
                inline: true
            }
        ])
        .addField("고가", res[0].high_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ","))
        .addFields([
            {
                name: "저가",
                value: res[0].low_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ","),
                inline: true
            },
            {
                name: "누적 거래량 (24H)",
                value: res[0].acc_trade_volume_24h.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ","),
                inline: true
            },
            {
                name: "누적 거래대금 (24H)",
                value: res[0].acc_trade_price_24h.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ","),
                inline: true
            }
        ])
        .addField("차트 보기", `[업비트 바로가기](https://upbit.com/exchange?code=CRIX.UPBIT.${market.market})`)
        .setFooter(`최근 거래 일시: ${res[0].trade_date_kst} ${res[0].trade_time_kst} KST\n데이터 제공: 업비트`)
}