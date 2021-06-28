export type userData = {
    accounts: account[],
    sumOfGivenMoney: number
} 

export type account = {
    id: string,
    coins: userCoin[]
}

export type userCoin = {
    coinCode: string,
    amount: number
}

export type ilegalChannel = {
    channelID: string,
    channelName: string,
    preferChannelID: string
}

export type coin = {
    market: string,
    korean_name: string,
    english_name: string
}

export type upbitResponseSuccess = upbitResponseMarket[];

export type upbitResponseMarket = {
    market: string,
    trade_date: string,
    trade_time: string,
    trade_date_kst: string,
    trade_time_kst: string,
    trade_timestamp: number,
    opening_price: number,
    high_price: number,
    low_price: number,
    trade_price: number,
    prev_closing_price: number,
    change: string,
    change_price: number,
    change_rate: number,
    signed_change_price: number,
    signed_change_rate: number,
    trade_volume: number,
    acc_trade_price: number,
    acc_trade_price_24h: number,
    acc_trade_volume: number,
    acc_trade_volume_24h: number,
    highest_52_week_price: number,
    highest_52_week_date: number,
    lowest_52_week_price: number,
    lowest_52_week_date: number,
    timestamp: number
}

export type upbitResponseFailed = {
    error: {
        name: number,
        message: string
    }
}