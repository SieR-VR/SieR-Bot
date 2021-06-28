import { is } from 'typescript-is';
import { Message, MessageEmbed } from 'discord.js';
import { formatNumber } from './component/Component'
import { fetchMarket, getAccount, getAllcoinData, updateAccount } from './component/DataManager';
import { userCoin, upbitResponseFailed } from './component/DataTypes';

const upbitPngUrl = 'https://static.upbit.com/logos/';

export const sellCoin = async (msg: Message, args: string[]) => {
    let coinCodeForSell = args.pop();
    if(coinCodeForSell === undefined) {
        return new MessageEmbed()
            .setTitle("도움말")
            .addField("매도 [코드1] [코드2] [양]", "[코드2]코인 보유량 중 [양]%를 매도하여 [코드1]코인을 얻습니다.")
            .setDescription("피매도 코인은 KRW, USDT, BTC만 가능합니다.")
    }
    coinCodeForSell = coinCodeForSell.toUpperCase();
    
    let coinCodeToSell = args.pop();
    if(coinCodeToSell === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }
    coinCodeToSell = coinCodeToSell.toUpperCase();

    let amount = args.pop();
    if(amount === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }

    const amountNum = Number(amount) / 100;
    if(isNaN(amountNum) || amountNum < 0 || amountNum > 1) {
        return new MessageEmbed()   
            .setTitle("오류!")
            .setDescription("양은 0 이상 100 이하의 실수만 가능합니다.")
    }

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    const allCoinData = getAllcoinData();
    const market = allCoinData.find(element => element.market === `${coinCodeForSell}-${coinCodeToSell}`)
    if(market === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCodeForSell}-${coinCodeToSell} 마켓을 찾을 수 없습니다.`)
    }

    let account = getAccount(msg.author.id);
    if(account === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 사용자: ${msg.author.username}`)
    }

    let isShortSelling = account.coins.find(coin => coin.coinCode === coinCodeToSell);
    if(isShortSelling !== undefined && isShortSelling.amount < 0) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeToSell}코인을 공매도 중입니다.`)
    } 

    const upbitRes = fetchMarket(`${market.market}`);
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

    const coinToSell = account.coins.find(element => element.coinCode === coinCodeToSell);
    if(coinToSell === undefined || coinToSell.amount === 0) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeToSell}코인을 가지고 있지 않습니다.`)
    }

    const accountForSell = account.coins.find(element => element.coinCode === coinCodeForSell);
    let embedTosend = new MessageEmbed();
    let coinForSell: userCoin;
    if(accountForSell === undefined) {
        coinForSell = {
            coinCode: coinCodeForSell,
            amount: (upbitRes[0].trade_price * coinToSell.amount * amountNum) * 0.9995
        }
        account.coins.push(coinForSell);
        embedTosend.addField("정보", `${coinCodeForSell}계좌가 없어 새로 개설하였습니다.`)
    }
    else {
        coinForSell = account.coins.find(element => element.coinCode === coinCodeForSell);
        account.coins = account.coins.filter(element => element.coinCode !== coinCodeForSell);

        coinForSell.amount += (upbitRes[0].trade_price * coinToSell.amount * amountNum) * 0.9995
        account.coins.push(coinForSell);
    }
    
    account.coins = account.coins.filter(element => element.coinCode !== coinCodeToSell);
    coinToSell.amount -= coinToSell.amount * amountNum;
    account.coins.push(coinToSell);

    embedTosend.setTitle("매도 성공")
    embedTosend.addField("매도가", `${formatNumber(upbitRes[0].trade_price)}${coinCodeToSell}`)
    embedTosend.addField(`${coinCodeForSell} 잔액`, `${formatNumber(coinForSell.amount)}${coinCodeForSell}`)
    embedTosend.addField(`${coinCodeToSell} 잔액`, `${formatNumber(coinToSell.amount)}${coinCodeToSell}`)
    embedTosend.addField(`거래 수수료`, `${formatNumber(coinForSell.amount * 0.0005)}${coinCodeForSell}`)
    embedTosend.setThumbnail(`${upbitPngUrl}${coinCodeToSell}.png`)

    updateAccount(account);
    return embedTosend;
}