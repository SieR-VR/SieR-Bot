import { Message, MessageEmbed } from 'discord.js';

export const help = async (msg: Message, args: string[]) => {
    return new MessageEmbed()
        .setTitle("도움말")
        .addField("도움말", "봇 도움말을 출력합니다.")
        .addField("코인 [코드]", "[코드]코인을 조회합니다.")
        .addField("계좌개설", "계좌를 개설합니다. 초기 금액은 1,000,000KRW입니다.")
        .addField("매수 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 매수합니다.")
        .addField("매도 [코드1] [코드2] [양]", "[코드2]코인 보유량 중 [양]%를 매도하여 [코드1]코인을 얻습니다.")
        .addField("계좌", "자신의 계좌를 조회합니다.")
        .addField("코인조회 [개수]", "[개수]만큼의 코인명을 조회합니다. 출력 코인 개수는 그보다 작을 수 있습니다.")
        .addField("숏 [코드1] [코드2] [양]", "[코드1] 코인을 [코드2]코인 [양]만큼 공매도합니다.")
        .setThumbnail(msg.author.avatarURL())
}