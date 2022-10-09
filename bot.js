const { Client, GatewayIntentBits, Partials, InteractionCollector} = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ], partials: [Partials.Channel]
});

const Config = require("./Config.json");

// 招待コードを記憶しておくためのオブジェクトを定義
let allInvites = {}

client.on('ready', async () => {
    console.log(`login: (${client.user.tag})`);
    // ボット起動時に全サーバーの招待コードを読み込んで記録する
    await Promise.all(client.guilds.cache.map(async guild => {
        try {
            const invites = await guild.invites.fetch();
            await Promise.all(invites.map(invite => {
                allInvites[invite.code] = { "uses": invite.uses };
            }));
        } catch (err) {
            console.log(err);
        }
    }));
    console.log(allInvites)
});

client.on('guildMemberAdd', async member => {
    // メンバーが参加したサーバーの招待コードを全て取得する
    const invites = await member.guild.invites.fetch();

    await Promise.all(invites.map(invite => {
        const item = allInvites[invite.code];
        if (item == undefined) {
            allInvites[invite.code] = { "uses": invite.uses };
            console.log(`${member.user.tag} は ${invite.code} を使ってサーバーに参加しました`);
        } else {
            if (item.uses != invite.uses) {
                allInvites[invite.code] = { "uses": invite.uses };
                console.log(`${member.user.tag} は ${invite.code} を使ってサーバーに参加しました`);
            }
        }
    }));
    console.log(allInvites);
})

client.login(Config.token);