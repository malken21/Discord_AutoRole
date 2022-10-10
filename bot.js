const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const Config = require("./Config.json");
Config.list.map(item => {
    item.url = item.url
        .replace("https://discord.com/invite/", "")
        .replace("https://discord.gg/", "");
    console.log(item);
    return item;
});

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
    console.log(allInvites);
});

client.on('guildMemberAdd', async member => {
    // メンバーが参加したサーバーの招待コードを全て取得する
    const invites = await member.guild.invites.fetch();

    await Promise.all(invites.map(invite => {
        const item = allInvites[invite.code];
        if (item == undefined) {
            allInvites[invite.code] = { "uses": invite.uses };
            console.log(`${member.user.tag} は https://discord.gg/${invite.code} を使ってサーバーに参加しました`);
            addRole(member, invite.code);
        } else {
            if (item.uses != invite.uses) {
                allInvites[invite.code] = { "uses": invite.uses };
                console.log(`${member.user.tag} は https://discord.gg/${invite.code} を使ってサーバーに参加しました`);
                addRole(member, invite.code);
            }
        }
    }));
});

function addRole(member, code) {
    Config.list.forEach(async item => {
        if (item.url == code) {
            const role = await member.guild.roles.fetch(item.role);
            console.log(`${member.user.tag} に ロール: ${role.name} を付与しました`);
            member.roles.add(role);
        }
    });
}


client.login(Config.token);