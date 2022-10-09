const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ], partials: [Partials.Channel]
});

const Config = require("./Config.json");

// 招待コードを記憶しておくためのオブジェクトを定義
const allInvites = {}

client.on('ready', () => {
    // ボット起動時に全サーバーの招待コードを読み込んで記録する

    client.guilds.cache.forEach(async guild => {
        const invites = await guild.invites.fetch()
        console.log(invites.map(invite => invite.url))
        /*guild.fetchInvites().then(invites => {
            allInvites[guild.id] = invites
        }).catch(console.error);*/
    })
})

client.on('guildMemberAdd', member => {
    // メンバーが参加したサーバーの招待コードを全て取得する
    member.guild.fetchInvites().then(invites => {
        // 以前に取得したサーバーの招待コードを変数に入れて保持する
        const oldInvites = allInvites[member.guild.id]
        // 新たに取得した招待コードに置き換え
        allInvites[member.guild.id] = invites
        // 以前に取得した招待コードと新たに取得したので、使用回数が増えたものを探す
        const invite = invites.find(i => oldInvites.get(i.code).uses < i.uses)
        // ログに出す
        console.log(`${member.user.tag} は ${invite.code} を使ってサーバーに参加しました`)
    }).catch(console.error);
})

client.login(Config.token);