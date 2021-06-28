import { is } from 'typescript-is';
import { MessageEmbed, Message } from 'discord.js';
import { formatNumber } from './component/Component'
import { checkIsCoinCodeValid, fetchMarket, getAccount, updateAccount } from './component/DataManager';
import { upbitResponseFailed, userCoin } from './component/DataTypes';

const upbitPngUrl = 'https://static.upbit.com/logos/';

export const buyCoin = async (msg: Message, args: string[]) => {
    let coinCodeToBuy = args.pop()
    if(coinCodeToBuy === undefined) {
        return new MessageEmbed()
            .setTitle("도움말")
            .addField("매수 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 매수합니다.")
            .setDescription("피매수 코인은 KRW, USDT, BTC만 가능합니다.")
    }
    coinCodeToBuy = coinCodeToBuy.toUpperCase();
    
    let coinCodeForBuy = args.pop();
    if(coinCodeForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }
    coinCodeForBuy = coinCodeForBuy.toUpperCase();

    const amount = args.pop();
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
    if(isNaN(amountNum) || amountNum <= 0) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${amount}은(는) 사용 가능한 구매량이 아닙니다.`)
    }

    const market = checkIsCoinCodeValid(`${coinCodeForBuy}-${coinCodeToBuy}`);
    if(market === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCodeForBuy}-${coinCodeToBuy} 마켓을 찾을 수 없습니다.`)
    }

    const upbitRes = await fetchMarket(market.market);
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

    const isShortSelling = account.coins.find(coin => coin.coinCode === coinCodeForBuy);
    if(isShortSelling !== undefined && isShortSelling.amount < 0) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeForBuy}코인을 공매도 중입니다.`)
    }

    let coinForBuy = account.coins.find(element => element.coinCode === coinCodeForBuy);
    if(coinForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeForBuy}코인을 가지고 있지 않습니다.`)
    }
    if(coinForBuy.amount < amountNum) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${formatNumber(coinForBuy.amount)}${coinCodeForBuy}밖에 없습니다. ${formatNumber(amountNum-coinForBuy.amount)}만큼의 ${coinCodeForBuy}가 필요합니다.`)
    }

    account.coins = account.coins.filter(element => element.coinCode !== coinCodeForBuy);
    coinForBuy.amount -= amountNum;
    account.coins.push(coinForBuy)

    let accountToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
    const embedTosend = new MessageEmbed();
    let coinToBuy: userCoin;
    if(accountToBuy === undefined) {
        coinToBuy = {
            coinCode: coinCodeToBuy,
            amount: (amountNum / upbitRes[0].trade_price) * 0.9995
        }
        account.coins.push(coinToBuy);
        embedTosend.addField("정보", `${coinCodeToBuy}계좌가 없어 새로 개설하였습니다.`)
    }
    else {
        coinToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
        account.coins = account.coins.filter(element => element.coinCode !== coinCodeToBuy);

        coinToBuy.amount += (amountNum / upbitRes[0].trade_price) * 0.9995
        account.coins.push(coinToBuy);
    }

    embedTosend.setTitle("매수 성공")
    embedTosend.addField("매수가", `${formatNumber(upbitRes[0].trade_price)}${coinCodeForBuy}`)
    embedTosend.addField(`${coinCodeToBuy} 잔액`, `${formatNumber(coinToBuy.amount)}${coinCodeToBuy}`)
    embedTosend.addField(`${coinCodeForBuy} 잔액`, `${formatNumber(coinForBuy.amount)}${coinCodeForBuy}`)
    embedTosend.addField(`거래 수수료`, `${formatNumber(amountNum / upbitRes[0].trade_price * 0.0005)}${coinCodeToBuy}`)
    embedTosend.setThumbnail(`${upbitPngUrl}${coinCodeToBuy}.png`)

    updateAccount(account);
    return embedTosend;
}
