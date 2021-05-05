import { MessageEmbed } from 'discord.js';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { formatNumber } from './component/component.js'

import allCoins from '../allCoin.json';

const fileName = './Private/userData.json';
const upbitUrl = 'https://api.upbit.com/v1/ticker';
const upbitPngUrl = 'https://static.upbit.com/logos/';

export const sellCoin = async (msg, args) => {
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

    amount = Number(amount);
    if(isNaN(amount) || amount < 0 || amount > 100) {
        return new MessageEmbed()   
            .setTitle("오류!")
            .setDescription("양은 0 이상 100 이하의 실수만 가능합니다.")
    }
    amount /= 100;

    if(args.pop() !== undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription("인수가 너무 많습니다.")
    }

    let market = allCoins.find(element => element.market === `${coinCodeForSell}-${coinCodeToSell}`)
    if(market === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`${coinCodeForSell}-${coinCodeToSell} 마켓을 찾을 수 없습니다.`)
    }

    let accounts = fs.readFileSync(fileName, 'utf8')
    accounts = JSON.parse(accounts);

    let account = accounts.accounts.find(element => element.id === msg.author.id);
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
    accounts.accounts = accounts.accounts.filter(element => element.id !== msg.author.id);

    const res = await fetch(`${upbitUrl}?markets=${market.market}`).then(res => res.json()).catch(err => {
        console.error(err);
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(JSON.stringify(err));
    });

    let coinToSell = account.coins.find(element => element.coinCode === coinCodeToSell);
    if(coinToSell === undefined) {
        return new MessageEmbed()
            .setTitle("오류!")
            .setDescription(`현재 ${coinCodeToSell}코인을 가지고 있지 않습니다.`)
    }

    let accountForSell = account.coins.find(element => element.coinCode === coinCodeForSell);
    let embedTosend = new MessageEmbed();
    let coinForSell = {};
    if(accountForSell === undefined) {
        coinForSell = {
            coinCode: coinCodeForSell,
            amount: (res[0].trade_price * coinToSell.amount * amount) * 0.9995
        }
        account.coins.push(coinForSell);
        embedTosend.addField("정보", `${coinCodeForSell}계좌가 없어 새로 개설하였습니다.`)
    }
    else {
        coinForSell = account.coins.find(element => element.coinCode === coinCodeForSell);
        account.coins = account.coins.filter(element => element.coinCode !== coinCodeForSell);

        coinForSell.amount += (res[0].trade_price * coinToSell.amount * amount) * 0.9995
        account.coins.push(coinForSell);
    }
    
    account.coins = account.coins.filter(element => element.coinCode !== coinCodeToSell);
    coinToSell.amount -= coinToSell.amount * amount;
    account.coins.push(coinToSell);

    embedTosend.setTitle("매도 성공")
    embedTosend.addField("매도가", `${formatNumber(res[0].trade_price)}${coinCodeToSell}`)
    embedTosend.addField(`${coinCodeForSell} 잔액`, `${formatNumber(coinForSell.amount)}${coinCodeForSell}`)
    embedTosend.addField(`${coinCodeToSell} 잔액`, `${formatNumber(coinToSell.amount)}${coinCodeToSell}`)
    embedTosend.addField(`거래 수수료`, `${formatNumber(coinForSell.amount * 0.0005)}${coinCodeForSell}`)
    embedTosend.setThumbnail(`${upbitPngUrl}${coinCodeToSell}.png`)

    accounts.accounts.push(account);
    fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2))

    return embedTosend;
}