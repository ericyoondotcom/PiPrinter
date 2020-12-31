import DiscordAPI from "discord.js";

import {DISCORD_TOKEN} from "../secrets.js";

export default class Discord {

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
    }

}