const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
let purple = botconfig.purple;
let xp = require("./xp.json");
const fs = require("fs");
const superagent = require("superagent");
let coins = require("./coins.json");
let cooldown = new Set();
let cdseconds = 86400;
let cooldownRep = new Set();
let cdsecondsRep = 43200;
let rep = require("./rep.json");

const bot = new Discord.Client({disableEveryone: true});

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);

  bot.user.setActivity("https://pornhub.com/", {url: "https://youtube.com/"});

  //bot.user.setGame("on SourceCade!");
});

bot.on("message", async message => {
  if(message.author.bot) return;

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if(cmd === `${prefix}kick`){
    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.send("Mentionne la personne à exclure");
    let kReason = args.join(" ").slice(22);
	if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("Tu ne possèdes pas les permissions pour exclure");
    if(kUser.hasPermission("ADMINISTRATOR")) return message.channel.send("La personne mentionnée possède les permissions d'administrateur");

	message.channel.send(`${kUser} a bien été exclu`)
    let kickEmbed = new Discord.RichEmbed()
    .setDescription("Exclusion")
    .setColor(purple)
    .addField("Personne exclu", `${kUser} with ID ${kUser.id}`)
    .addField("Exclut par", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Pendant", message.createdAt)
    .addField("Raison", kReason);

    let kickChannel = message.guild.channels.find(`name`, "logs");

    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickEmbed);

    return;
  }

  if(cmd === `${prefix}ban`){
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send("Mentionne la personne à bannir");
    let bReason = args.join(" ").slice(22);
	if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("Tu ne possèdes pas les permissions pour bannir");
    if(bUser.hasPermission("ADMINISTRATOR")) return message.channel.send("La personne mentionnée possède les permissions d'administrateur");

	message.channel.send(`${bUser} a bien été exclu`)
    let banEmbed = new Discord.RichEmbed()
    .setDescription("Bannissement")
    .setColor(purple)
    .addField("Personne bannit", `${bUser} with ID ${bUser.id}`)
    .addField("Bannit par", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Pendant", message.createdAt)
    .addField("Raison", bReason);
    let incidentchannel = message.guild.channels.find(`name`, "logs");

    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed);
    return;
  }

  if(cmd === `${prefix}serverinfo`){

    let sicon = message.guild.iconURL;
    let serverembed = new Discord.RichEmbed()
    .setAuthor(`Informations du Serveur`, message.guild.iconURL)
    .setDescription(`Informations de ${message.guild.name}`)
    .setThumbnail(message.guild.iconURL)
	.setColor(purple)
    .addField("ID", message.guild.id, false)
    .addField("Propriétaire du Serveur", message.guild.owner.user.tag)
    .addField("Membres", message.guild.members.size, true)
    .addField("Région", message.guild.region, true)
    .addField("Création", message.guild.createdAt, true)
    .addField("Rôles", message.guild._sortedRoles.map(r => r.name).reverse().join(", "), false)

    return message.channel.send(serverembed);
  }

  if(cmd === `${prefix}botinfo`){

    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("Information du Bot")
    .setColor(purple)
    .setThumbnail(bicon)
    .addField("Nom du Bot", bot.user.username)
    .addField("Créer le", bot.user.createdAt);

    return message.channel.send(botembed);
  }
  
  if(cmd === `${prefix}mp`){
	const sayMessage = args.slice(1).join(' ');
    if(message.author.id !=='300669538674933761') {
		return message.channel.send("Seul le propriétaire du bot peut faire cette commande. (cheh)");
	}
    if (message.mentions.users.first()) {
        let user = message.mentions.users.first();
        let client = message.channel.client;
        message.delete().catch();
        user.createDM().then(channel => {
            channel.send(sayMessage)
        })
    }
	else {
        message.author.createDM().then(channel => {
            channel.send(sayMessage)
        })
    }
  }
  
  if(cmd === `${prefix}say`){
	if((message.member.hasPermission("ADMINISTRATOR")) || (message.author.id ==='402508496790093824') || (message.author.id ==='300669538674933761') || (message.author.id ==='530892198250545164')) {
		const sayMessage = args.join(" ");
		message.delete().catch();
		message.channel.send(sayMessage);
	}
	if((!message.member.hasPermission("ADMINISTRATOR")) || (!message.author.id ==='402508496790093824') || (!message.author.id ==='300669538674933761') || (!message.author.id ==='530892198250545164')) {
		return;
	}
  }
  
  let xpAdd = Math.floor(Math.random() * 7) + 8;

  if(!xp[message.author.id]){
    xp[message.author.id] = {
      xp: 0,
      level: 1
    };
  }


  let curxp = xp[message.author.id].xp;
  let curlvl = xp[message.author.id].level;
  let nxtLvl = xp[message.author.id].level * 100 + 200;
  xp[message.author.id].xp =  curxp + xpAdd;
  if(nxtLvl <= xp[message.author.id].xp){
		xp[message.author.id].level = curlvl + 1;
		xp[message.author.id].xp = 0;
		coins[message.author.id] = {coins: coins[message.author.id].coins + parseInt((curlvl * 250) / 2)};
		let lvlup = new Discord.RichEmbed()
		.setTitle("Niveau Supérieur !")
		.setColor(purple)
		.addField("Nouveau Niveau", curlvl + 1)
		.addField("Tu as gagné", parseInt((curlvl * 250) / 2) + "$");

    message.channel.send(lvlup).then(msg => {msg.delete(5000)});
  }
  
	fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
		if(err) console.log(err)
	});
  
  if(cmd === `${prefix}level`) {
	if(!xp[message.author.id]) {
		xp[message.author.id] = {xp: 0, level: 1};
	}
	let curxp = xp[message.author.id].xp;
	let curlvl = xp[message.author.id].level;
	let nxtLvlXp = curlvl * 200 + 100;
	let difference = nxtLvlXp - curxp;
	
	let lvlEmbed = new Discord.RichEmbed()
	.setAuthor(message.author.username)
	.setColor(purple)
	.addField("Niveau", curlvl, true)
	.addField("XP", curxp, true)
	.setFooter(`${difference} XP Avant Prochain Niveau Supérieur`, message.author.displayAvatarURL);

  message.channel.send(lvlEmbed)};
  
  if (message.author == bot.user) {
      return
  }
  if (message.content.includes(bot.user.toString())) {
      return message.channel.send("Ta gueule");
  }
  
  if(cmd === `${prefix}help`) {
	let CHelp = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Informations", "`n!helpinfo`")
    .addField("Messages", "`n!helpmessages`")
	.addField("Admin", "`n!helpadmin`")
	.addField("Level", "`n!helplevel`")
	.addField("Argent", "`n!helpargent`")
	.addField("Images", "`n!helpimages`")
	.setFooter(`Effectuez ces commandes pour avoir plus d'informations sur les commandes`, bot.user.displayAvatarURL);
	
	return message.channel.send(CHelp);
  }
  
  if(cmd === `${prefix}helpinfo`) {
	let HelpI = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Server Informations", "`n!serverinfo`", true)
	  .addField("Bot Informations", "`n!botinfo`", true)
	.setFooter(`Les informations sont restreinctes et peuvent être améliorées par le future`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpI);
  }
  
  if(cmd === `${prefix}helpmessages`) {
	let HelpM = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Faire parler le Bot", "`n!say` message", true)
    .addField("Envoyer un MP via le Bot", "`n!mp` @user message", true)
    .addField("Effacer des Messages", "`n!clear` amount_messages", true)
	.setFooter(`Vous devrez posséder certaines permissions pour effectuer ces commandes`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpM);
  }
  
  if(cmd === `${prefix}helpadmin`) {
	let HelpA = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Exclure", "`n!kick` @user reason", true)
	  .addField("Bannir", "`n!ban` @user reason", true)
	.setFooter(`Les raisons sont visibles dans le salon #logs`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpA);
  }
  
  if(cmd === `${prefix}helplevel`) {
	let HelpL = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Voir Son Niveau", "`n!level`", true)
	.setFooter(`Les niveaux sont sauvegardés et visibles sur tous les serveurs`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpL);
  }
  
  if(cmd === `${prefix}helpargent`) {
	let HelpAr = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Voir son Argent", "`n!money`", true)
	.addField("Donner de l'argent à quelqu'un", "`n!pay` @user amount", true)
	.setFooter(`Money, money, money`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpAr);
  }
  
  if(cmd === `${prefix}helpimages`) {
	let HelpI = new Discord.RichEmbed()
	.setDescription("Commandes du Bot")
    .setColor(purple)
    .addField("Calins", "`n!hug` @user", true)
	.addField("Bisous", "`n!kiss` @user", true)
	.addField("Baffe", "`n!slap` @user", true)
	.addField("Manger", "`n!feed` @user", true)
	.addField("Caresses", "`n!pat` @user", true)
	.addField("Nekos", "`n!neko`", true)
	.addField("Rire discret", "`n!smug`", true)
	.addField("LEWD Neko (:underage:)", "`n!nekolewd`", true)
	.addField("Hentai (:underage:)", "`n!hentai`", true)
	.addField("Loli (:underage: !!!)", "`n!loli`", true)
	.setFooter(`Amuse-toi bien avec ces images`, bot.user.displayAvatarURL);
	
	return message.channel.send(HelpI);
  }
  
  if(cmd === `${prefix}hug`) {
	let hugUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!hugUser) return message.reply("Tu dois mentionner quelqu'un pour utiliser cette commande.");

    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/hug`);

    let hugEmbed = new Discord.RichEmbed()
    .setDescription(`**${message.author.username}** a fait un calin à **${message.mentions.users.first().username}**! :3`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(hugEmbed);
  }
  
  if(cmd === `${prefix}kiss`) {
	let hugUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!hugUser) return message.reply("Tu dois mentionner quelqu'un pour utiliser cette commande.");

    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/kiss`);

    let kissEmbed = new Discord.RichEmbed()
    .setDescription(`**${message.author.username}** a embrassé **${message.mentions.users.first().username}**! :heart:`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(kissEmbed);
  }
  
  if(cmd === `${prefix}slap`) {
	let hugUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!hugUser) return message.reply("Tu dois mentionner quelqu'un pour utiliser cette commande.");

    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/slap`);

    let slapEmbed = new Discord.RichEmbed()
    .setDescription(`**${message.author.username}** a baffé **${message.mentions.users.first().username}**! oof`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(slapEmbed);
  }
  
  if(cmd === `${prefix}nekolewd`) {
	if (!message.channel.nsfw) return message.reply("tu peux utiliser cette commande seulement dans un salon NSFW !");
	  
    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/lewd`);

    let lewdnEmbed = new Discord.RichEmbed()
    .setDescription(`Wola t'es un fan de Nekos`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(lewdnEmbed);
  }
  
  if(cmd === `${prefix}feed`) {

    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/feed`);

    let lewdnEmbed = new Discord.RichEmbed()
    .setDescription(`Miam :meat_on_bone: :heart: ! :3`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(lewdnEmbed);
  }
  
  if(cmd === `${prefix}loli`) {
    let body = {"url":"https://media.tenor.com/images/7aec1c8df8b5653666483320ed50fdd8/tenor.gif"}

    let loliEmbed = new Discord.RichEmbed()
    .setDescription(`FBI OPEN UP !!!`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(loliEmbed);
  }
  
  if(cmd === `${prefix}hentai`) {
	if (!message.channel.nsfw) return message.reply("tu peux utiliser cette commande seulement dans un salon NSFW !");
	  
    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/hentai`);

    let hentaiEmbed = new Discord.RichEmbed()
    .setDescription(`YAMETE :octopus: !!!`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(hentaiEmbed);
  }
  
  if(cmd === `${prefix}neko`) {
	  
    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/neko`);

    let nekoEmbed = new Discord.RichEmbed()
    .setDescription(`Nyan :cat: !`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(nekoEmbed);
  }
  
  if(cmd === `${prefix}pat`) {
	let hugUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!hugUser) return message.reply("Tu dois mentionner quelqu'un pour utiliser cette commande.");
	  
    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/pat`);

    let patEmbed = new Discord.RichEmbed()
    .setDescription(`**${message.author.username}** a caressé **${message.mentions.users.first().username}**! :3`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(patEmbed);
  }
  
  if(cmd === `${prefix}smug`) {
	  
    const {body} = await superagent
    .get(`https://nekos.life/api/v2/img/smug`);

    let smugEmbed = new Discord.RichEmbed()
    .setDescription(`Hehehee... :smirk: !`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(smugEmbed);
  }
  
  if(cmd === `${prefix}cheh`) {
	  
    let body = {"url":"https://media.tenor.com/images/d95b80b9f5dab49bffdda635341fb8d5/tenor.gif"}

    let chehEmbed = new Discord.RichEmbed()
    .setDescription(`CHEH !`)
    .setImage(body.url)
    .setColor(purple)

    return message.channel.send(chehEmbed);
  }
  
  if(!coins[message.author.id]){
    coins[message.author.id] = {coins: 0};
  }

  if(!cmd === `${prefix}money`) {
	let coinAmt = Math.floor(Math.random() * 7) + 1;
	let baseAmt = Math.floor(Math.random() * 7) + 1;

	coins[message.author.id] = {coins: coins[message.author.id].coins + coinAmt}; }
  
  fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
    if (err) console.log(err)
  });
  
  let userC = coins[message.author.id].coins;
  if (userC < 0) {
	  coins[message.author.id] = {coins: 0};
  }
	
  if(message.author.id === '515431426670329878') {
	coins[message.author.id] = {coins: 50}; }
  
  if(cmd === `${prefix}money`) {
	let uCoins = coins[message.author.id].coins;
	let coinsEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
	.setColor(purple)
	.addField("Argent :", uCoins + "$");
	
	return message.channel.send(coinsEmbed);
  }
  
  if(cmd === `${prefix}pay`) {
	if(!coins[message.author.id]){return message.reply("Tu n'as pas d'argent")}
	let pUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
	let nombre = args.slice(1).join(" ");
	if(!coins[pUser.id]){coins[pUser.id] = {coins: 0};}
	if (isNaN(parseInt(args[1]))) return message.reply("Tu dois mettre le montant !")
	if(args[1] < 0) return message.reply("Tu ne peux pas envoyer un montant négatif !")
	if(parseInt(args[1]) === 0) return message.reply("Tu ne peux pas envoyer un montant nul !")
	let pCoins = coins[message.guild.member(message.mentions.users.first()).id].coins;
	let sCoins = coins[message.author.id].coins;
	if(pUser.id === message.author.id) {
	return message.channel.send(`Tu ne peux pas te donner de l'argent à toi même`); }
	else {
		if(sCoins >= nombre) {
			coins[message.author.id] = {coins: sCoins - parseInt(args[1])};
			coins[pUser.id] = {coins: pCoins + parseInt(args[1])};
			message.channel.send(`${message.author} a donné ${args[1]}$ à ${pUser}.`);
			fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {if(err) cosole.log(err)});
			return
		}
		else {return message.reply("Tu n'as pas assez d'argent");}
	}
  }
  
  if(cmd === `${prefix}givem`) {
	if(message.author.id === '300669538674933761') {
		let nombreMoneyG = args.join(" ");
		coins[message.author.id] = {coins: coins[message.author.id].coins + parseInt(nombreMoneyG)};
		return message.channel.send(`${message.author}, tu viens de te donner ${nombreMoneyG}$`);
	}
	else {
		return message.channel.send("Seul le propriétaire du bot peut faire cette commande. (cheh)");
	}
  }
  
  if(cmd === `${prefix}resetm`) {
	if(message.author.id === '300669538674933761') {
	 coins[message.author.id] = {coins: 500};
	 return message.channel.send("Reset d'argent effectué avec succès !");
	}
	else {
		return message.channel.send("Seul le propriétaire du bot peut faire cette commande. (cheh)");
	}
  }
  
  if (message.channel.type === "dm") {
    args = message.content.split(" ").slice(0)
    args = args.slice(0).join(" ")

    if(cmd === `${prefix}`) return message.channel.send(":x: Utilise une commande dans un vrai serveur :x:")
    if (args.length > 256) return message.reply("Ton message contient trop de lettre :/")
    var MessageMP = new Discord.RichEmbed()
        .setColor(purple)
        .setTitle("Nouveau MP !")
		.setTimestamp()
        .addField(args, "Envoyé par : " + message.author.username + " et son ID : " + message.author.id)
    bot.guilds.get("565192705848901652").channels.get("565192705848901654").send(MessageMP)
  }
	
	if(cmd === `${prefix}reply`) {
		if (message.author.id !== "300669538674933761") return message.reply('Seul le propriétaire du Bot peut utiliser cette commande ! (Cheh)')
		args = message.content.split(" ").slice(0)
		Rargs = message.content.split(" ").slice(2).join(" ")
		var userID = args[1]
		if (isNaN(args[1])) return message.reply("Ce n'est pas un ID !")
		var ReponseMP = new Discord.RichEmbed()
			.setColor(purple)
			.setTitle("Le Propriétaire du Bot vous a répondu !")
			.setDescription(Rargs)
			.setTimestamp()
			.setFooter("Envoyé par : " + message.author.username + " !", message.author.displayAvatarURL)
		bot.users.get(userID).send(ReponseMP)
	}
	
  if(cmd === `${prefix}servers`) {
	if (message.author.id !== "300669538674933761") return message.reply('Seul le propriétaire du Bot peut utiliser cette commande ! (Cheh)')
	let bicon = bot.user.displayAvatarURL;
    let string = '';
    bot.guilds.forEach(guild => {
    string += guild.name + '\n';})
    let bt = bot.user.username;
    let botembed = new Discord.RichEmbed()
        .setColor(purple)
        .addField("Liste des serveurs :", string)
        .setTimestamp()
        .setFooter(message.author.username, message.author.avatarURL);
    message.channel.send(botembed);
  }
  
  if(cmd === `${prefix}daily`) {
	if(cooldown.has(message.author.id)){
		fs.writeFile("./cooldown.json", JSON.stringify(cdseconds), (err) => {
			if (err) console.log(err)
		});
		return message.reply("Tu dois attendre 1 jour avant de pouvoir refaire cette commande !")
    }
	coins[message.author.id] = {coins: coins[message.author.id].coins + parseInt(500)};
	message.channel.send("Tu as gagné 500$ !")
	cooldown.add(message.author.id);
  }
  
  let reputUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if(!rep[reputUser]) {
		rep[reputUser] = {rep: 0};
  }
  if(!rep[message.author.id]) {
		rep[message.author.id] = {rep: 0};
  }
  fs.writeFile("./rep.json", JSON.stringify(rep), (err) => {
		if (err) console.log(err)
  });
  
  if(cmd === `${prefix}rep`) {
	if(!args[0]) return message.channel.send("Tu dois mentionner quelqu'un !");
	let repUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
	if(!repUser) return message.channel.send("Tu dois mentionner la personne en question !");
	if(!rep[repUser]) {
		rep[repUser] = {rep: 0};
	}
	if(cooldownRep.has(message.author.id)){
		return message.reply("Tu dois attendre 12h avant de pouvoir refaire cette commande !")
    }
	rep[repUser.id] = {rep: rep[message.author.id].rep + parseInt(1)};
	message.channel.send(`Tu viens de donner un rep à ${message.mentions.users.first().username} !`)
	cooldownRep.add(message.author.id);
	fs.writeFile("./rep.json", JSON.stringify(rep), (err) => {
		if (err) console.log(err)
	});
  }
  
  if(cmd === `${prefix}myrep`) {
	if(!rep[message.author.id]) {
		rep[message.author.id] = {rep: 0};
	}
	let uReps = rep[message.author.id].rep;
	var repsEmbed = new Discord.RichEmbed()
		.setAuthor(message.author.username)
		.setColor(purple)
		.addField("Ton nombre de Réputation", uReps)
		.setFooter("Les Reps servent à rien mais c'est drôle", message.author.displayAvatarURL)
		.setTimestamp()
	return message.channel.send(repsEmbed);
  }
  
  if(cmd === `${prefix}clear`) {
	if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR") && (!message.author.id ==='300669538674933761')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande !").then(msg => {msg.delete(2500)});
    let clearargs = args.join(" ");
	let Clear = 1 + parseInt(clearargs);

	if(!args[0]) return message.channel.send("Tu n'as pas précisé le nombre de messages à supprimer.").then(msg => {msg.delete(2000)});
	if(Clear >= 100) return message.channel.send("Tu ne peux pas supprimer plus de 100 messages en même temps").then(msg => {msg.delete(2000)});
	if(Clear === 1) { return message.delete().catch().then(() => {message.channel.send("Tu ne peux pas supprimer 0 message").then(msg => {msg.delete(2000)});}) }
	if(Clear === 2) {
		message.channel.bulkDelete(Clear).then(() => {
			message.channel.send(`${args[0]} message a été supprimé !`).then(msg => {msg.delete(1500)});
			return})}
	if(Clear > 2) {
		message.channel.bulkDelete(Clear).then(() => {
			message.channel.send(`${args[0]} messages ont étés supprimés !`).then(msg => {msg.delete(1500)});
			return})}
  }
  
  setTimeout(() => {
    cooldown.delete(message.author.id)
  }, cdseconds * 1000)
  
  setTimeout(() => {
    cooldownRep.delete(message.author.id)
  }, cdsecondsRep * 1000)
  
});

bot.login(tokenfile.token);
