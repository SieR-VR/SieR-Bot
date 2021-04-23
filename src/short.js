import { MessageEmbed } from 'discord.js';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { formatNumber } from './component/component.js'

import allCoins from '../allCoin.json';

const fileName = './Private/userData.json';
const upbitUrl = 'https://api.upbit.com/v1/ticker';
const upbitPngUrl = 'https://static.upbit.com/logos/';

export const short = async (msg, args) => {
    let coinCodeToBuy = args.pop().toUpperCase();
    if(coinCodeToBuy === undefined) {
        return new MessageEmbed()
            .setTitle("도움말")
            .addField("숏 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 공매도합니다.")
            .setDescription("피공매도 코인은 KRW, USDT, BTC만 가능합니다.")
    }
    
    let coinCodeForBuy = args.pop().toUpperCase();
    if(coinCodeForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .addField("인수가 부족합니다.", "자세한 것은 '시어 매수'를 통해 확인하세요.")
    }

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

    let amountNum = Number(amount);
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

    let market = allCoins.find(element => element.market === `${coinCodeForBuy}-${coinCodeToBuy}`)
    if(market === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCodeForBuy}-${coinCodeToBuy} 마켓을 찾을 수 없습니다.`)
    }

    const res = await fetch(`${upbitUrl}?markets=${market.market}`).then(res => res.json()).catch(err => {
        console.error(err);
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(JSON.stringify(err));
    });

    let accounts = fs.readFileSync(fileName, 'utf8')
    accounts = JSON.parse(accounts);

    let account = accounts.accounts.find(element => element.id === msg.author.id);
    if(account === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`존재하지 않는 사용자: ${msg.author.username}`)
    }
    accounts.accounts = accounts.accounts.filter(element => element.id !== msg.author.id);

    let coinForBuy = account.coins.find(element => element.coinCode === coinCodeForBuy);
    if(coinForBuy === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeForBuy}코인을 가지고 있지 않습니다.`)
    }

    account.coins = account.coins.filter(element => element.coinCode !== coinCodeForBuy);
    coinForBuy.amount += amount * 0.9995;
    account.coins.push(coinForBuy)

    let accountToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
    let embedTosend = new MessageEmbed();
    let coinToBuy = {};
    if(accountToBuy === undefined) {
        coinToBuy = {
            coinCode: coinCodeToBuy,
            amount: ((amount / res[0].trade_price) * -1)
        }
        account.coins.push(coinToBuy);
        embedTosend.addField("정보", `${coinCodeToBuy}계좌가 없어 새로 개설하였습니다.`)
    }
    else {
        coinToBuy = account.coins.find(element => element.coinCode === coinCodeToBuy);
        account.coins = account.coins.filter(element => element.coinCode !== coinCodeToBuy);

        coinToBuy.amount += ((amount / res[0].trade_price) * -1)
        account.coins.push(coinToBuy);
    }

    embedTosend.setTitle("공매도 성공")
    embedTosend.addField("공매도가", `${formatNumber(res[0].trade_price)}${coinCodeForBuy}`)
    embedTosend.addField(`${coinCodeToBuy} 잔액`, `${formatNumber(coinToBuy.amount)}${coinCodeToBuy}`)
    embedTosend.addField(`${coinCodeForBuy} 잔액`, `${formatNumber(coinForBuy.amount)}${coinCodeForBuy}`)
    embedTosend.addField(`거래 수수료`, `${formatNumber(amount * 0.0005)}${coinCodeForBuy}`)
    embedTosend.setThumbnail(`${upbitPngUrl}${coinCodeToBuy}.png`)

    accounts.accounts.push(account);
    fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2))

    return embedTosend;
}
