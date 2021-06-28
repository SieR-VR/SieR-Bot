import { is } from 'typescript-is';
import { Message, MessageEmbed } from 'discord.js';
import { formatNumber } from './component/Component'
import { fetchMarket, getAccount, getAllcoinData, updateAccount } from './component/DataManager';
import { upbitResponseFailed, userCoin } from './component/DataTypes';

const upbitPngUrl = 'https://static.upbit.com/logos/';

export const short = async (msg: Message, args: string[]) => {
    let coinCodeToBuy = args.pop();
    if(coinCodeToBuy === undefined) {
        return new MessageEmbed()
            .setTitle("도움말")
            .addField("숏 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 공매도합니다.")
            .setDescription("피공매도 코인은 KRW, USDT, BTC만 가능합니다.")
    }
    coinCodeToBuy = coinCodeToBuy.toUpperCase();
    
    let coinCodeForBuy = args.pop();
    if(coinCodeForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }
    coinCodeForBuy = coinCodeForBuy.toUpperCase();

    let amount = args.pop();
    if(amount === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    const amountNum = Number(amount);
    if(isNaN(amountNum)) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${amount}은(는) 사용 가능한 공매도량이 아닙니다.`)
    }
    if(amountNum <= 0) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("0 이하로 공매도할 수 없습니다.")
    }

    const allCoinData = getAllcoinData();
    const market = allCoinData.find(element => element.market === `${coinCodeForBuy}-${coinCodeToBuy}`)
    if(market === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCodeForBuy}-${coinCodeToBuy} 마켓을 찾을 수 없습니다.`)
    }

    const upbitRes = fetchMarket(market.market)
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

    let account = getAccount(msg.author.id);
    if(account === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 사용자: ${msg.author.username}`)
    }

    let coinForBuy = account.coins.find(element => element.coinCode === coinCodeForBuy);
    if(coinForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeForBuy}코인을 가지고 있지 않습니다.`)
    }

    account.coins = account.coins.filter(element => element.coinCode !== coinCodeForBuy);
    coinForBuy.amount += amountNum * 0.9995;
    account.coins.push(coinForBuy)

    const accountToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
    const embedTosend = new MessageEmbed();
    let coinToBuy: userCoin;
    if(accountToBuy === undefined) {
        coinToBuy = {
            coinCode: coinCodeToBuy,
            amount: ((amountNum / upbitRes[0].trade_price) * -1)
        }
        account.coins.push(coinToBuy);
        embedTosend.addField("정보", `${coinCodeToBuy}계좌가 없어 새로 개설하였습니다.`)
    }
    else {
        coinToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
        account.coins = account.coins.filter(element => element.coinCode !== coinCodeToBuy);

        coinToBuy.amount += ((amountNum / upbitRes[0].trade_price) * -1)
        account.coins.push(coinToBuy);
    }

    embedTosend.setTitle("공매도 성공")
    embedTosend.addField("공매도가", `${formatNumber(upbitRes[0].trade_price)}${coinCodeForBuy}`)
    embedTosend.addField(`${coinCodeToBuy} 잔액`, `${formatNumber(coinToBuy.amount)}${coinCodeToBuy}`)
    embedTosend.addField(`${coinCodeForBuy} 잔액`, `${formatNumber(coinForBuy.amount)}${coinCodeForBuy}`)
    embedTosend.addField(`거래 수수료`, `${formatNumber(amountNum * 0.0005)}${coinCodeForBuy}`)
    embedTosend.setThumbnail(`${upbitPngUrl}${coinCodeToBuy}.png`)

    updateAccount(account);

    return embedTosend;
}
