import DiscordAPI from "discord.js";

import {DISCORD_TOKEN, ALLOWED_DISCORD_CHANNELS} from "../secrets.js";
import Printer from "./printer.js";

export default class Discord {

    /**
     * @param {Printer} printer 
     */
    constructor(printer){
        this.printer = printer;
        this.bot = new DiscordAPI.Client();
        this.registerBotListeners();
        this.bot.login(DISCORD_TOKEN);
    }

    registerBotListeners(){
        this.bot.on("ready", () => {
            console.log("Discord bot up!");
        });

        this.bot.on("message", this.onMessage);
    }

    /**
     * Listener callback for when a message is receieved
     * @param {DiscordAPI.Message} msg 
     */
    onMessage = async (msg) => {
        if(!ALLOWED_DISCORD_CHANNELS.includes(msg.channel.id)) return;
        if(msg.author.bot) return;
        try {
            await this.printer.printStringUsingCUPS(msg.cleanContent);
        } catch(e){
            console.error(e);
            return;
        }
        try {
            await msg.react("✅");
        } catch(e){
            console.error(e);
            return;
        }
    }
}