import { Message } from 'discord.js';
import * as fs from 'fs';
import fetch from 'node-fetch';

import * as DataTypes from './DataTypes';

const upbitUrl = 'https://api.upbit.com/v1/ticker';

export function checkIlegalChannel(msg: Message): DataTypes.ilegalChannel | undefined {
    const ilegalChannels: DataTypes.ilegalChannel[] = JSON.parse(fs.readFileSync("./Private/ilegalChannel.json", 'utf-8'));
    return ilegalChannels.find(channel => channel.channelID === msg.channel.id);
}

export function addUser(id: string, startKRWAmount: number): boolean {
    const users: DataTypes.userData = JSON.parse(fs.readFileSync("./Private/userData.json", 'utf-8'));
    if(users.accounts.find(account => account.id === id)) return false;

    users.accounts.push({
        id: id,
        coins: [{ coinCode: "KRW", amount: startKRWAmount }]
    })
    users.sumOfGivenMoney += startKRWAmount;

    fs.writeFileSync("./Private/userData.json", JSON.stringify(users, null, 2));
    return true;
}

export function checkUser(id: string): boolean {
    const users: DataTypes.userData = JSON.parse(fs.readFileSync("./Private/userData.json", 'utf-8'));
    if(users.accounts.find(account => account.id === id)) return true;
    else return false;
}

export function checkIsCoinCodeValid(marketCode: string): DataTypes.coin | undefined {
    const coins: DataTypes.coin[] = JSON.parse(fs.readFileSync("./Private/allCoin.json", 'utf-8'));
    return coins.find(coin => coin.market === marketCode);
}

export function getAccount(id: string): DataTypes.account | undefined {
    const users: DataTypes.userData = JSON.parse(fs.readFileSync("./Private/userData.json", 'utf-8'));
    return users.accounts.find(account => account.id === id);
}

export function updateAccount(userAccount: DataTypes.account): boolean {
    let users: DataTypes.userData = JSON.parse(fs.readFileSync("./Private/userData.json", 'utf-8'));
    if(!checkUser(userAccount.id)) false;

    users.accounts = users.accounts.filter(account => account.id !== userAccount.id);

    fs.writeFileSync("./Private/userData.json", JSON.stringify(users, null, 2));
    return true;
}

export function fetchMarket(marketCode: string): Promise<DataTypes.upbitResponseSuccess | DataTypes.upbitResponseFailed | undefined> {
    return new Promise(async (resolve, reject) => {
        const upbitResRaw = await fetch(`${upbitUrl}?markets=${marketCode}`)
        .catch((err) => {
            console.error(err);
            reject(new Error("Request is failed"));
        })
        if(upbitResRaw) resolve(upbitResRaw.json());
        else resolve(undefined);
    })
}

export function getAllcoinData(): DataTypes.coin[] {
    const coins: DataTypes.coin[] = JSON.parse(fs.readFileSync("./Private/allCoin.json", 'utf-8'));
    return coins;
}

export function getToken(): string {
    const botToken: { token: string } = JSON.parse(fs.readFileSync("./Private/token.json", 'utf-8'));
    return botToken.token;
}