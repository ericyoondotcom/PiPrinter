import DiscordAPI from "discord.js";
import canvasLib from "canvas";
import {DISCORD_TOKEN, ALLOWED_DISCORD_CHANNELS, MAX_DISCORD_MESSAGE_HEIGHT, DISCORD_ADMIN_UIDS, DISCORD_RATE_LIMIT, MINIMUM_IMAGE_ASPECT, DISCORD_ADDS_TO_QUEUE, DISCORD_NOTIFICATION_USER} from "../config.js";
import Printer from "./printer.js";
import { getCanvasWordWrapLines } from "./utility.js";

const CANVAS_SCALE = 10;
const CANVAS_WIDTH = 220 * CANVAS_SCALE;
const CANVAS_MAX_HEIGHT = MAX_DISCORD_MESSAGE_HEIGHT * CANVAS_SCALE;
const AVATAR_SIZE = 40 * CANVAS_SCALE;
const BODY_TEXT_MARGIN_LEFT = AVATAR_SIZE + (16 * CANVAS_SCALE);
const BODY_TEXT_MARGIN_TOP = 18 * CANVAS_SCALE;
const FONT_SIZE = 16 * CANVAS_SCALE;

export default class Discord {

    /**
     * @param {Printer} printer 
     */
    constructor(printer){
        this.printer = printer;
        this.bot = new DiscordAPI.Client();
        this.registerBotListeners();
        this.bot.login(DISCORD_TOKEN);
        this.lastMessageTimestamps = {};
    }

    registerBotListeners(){
        this.bot.on("ready", async () => {
            console.log("Discord bot up!");
            this.notificationUser = DISCORD_NOTIFICATION_USER.length > 0 ? await this.bot.users.fetch(DISCORD_NOTIFICATION_USER) : null;
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
        console.log("Processing message from " + msg.author.username);
        if(!this.isAdmin(msg.author.id) && (msg.author.id in this.lastMessageTimestamps)){
            const difference = (Date.now() - this.lastMessageTimestamps[msg.author.id]);
            if(difference < DISCORD_RATE_LIMIT){
                msg.react("❌");
                msg.channel.send(`<@${msg.author.id}>, Please wait ${Math.ceil((DISCORD_RATE_LIMIT - difference) / (60 * 1000))} mins before sending another message.`);
                return;
            }
        }
        let hasImage = false;
        let attachment = null;
        if(msg.attachments.size > 0){
            attachment = msg.attachments.first();
            if(attachment.width != null && attachment.height != null){
                const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif"];
                for(let i of IMAGE_EXTENSIONS){
                    if(attachment.name.toLowerCase().endsWith(i)){
                        hasImage = true;
                        break;
                    }
                }
            }
        }
        if(hasImage){
            if(attachment.width / attachment.height < MINIMUM_IMAGE_ASPECT && MINIMUM_IMAGE_ASPECT > 0){
                msg.react("❌");
                msg.channel.send(`<@${msg.author.id}>, your image is too tall! Please pick an image with a wider aspect ratio.`);
                return;
            }
        }

        this.lastMessageTimestamps[msg.author.id] = Date.now();
        try {
            // await this.printer.printStringUsingCUPS(msg.cleanContent);
            await this.printMessageFancy(msg);
            if(hasImage){
                await this.printer.printImageFromURL(attachment.url, DISCORD_ADDS_TO_QUEUE);
            }
            await msg.react("✅");
            if(this.notificationUser != null){
                await this.notificationUser.send(`${msg.author.username} printed a message!`);
            }
        } catch(e){
            console.error(e);
            return;
        }
    }

    /**
     * Prints a message as an image, emulating the Discord interface.
     * @param {DiscordAPI.Message} msg The message object sent from Discord. 
     */
    printMessageFancy = async (msg) => {
        const canvas = canvasLib.createCanvas(CANVAS_WIDTH, CANVAS_MAX_HEIGHT);
        const context = canvas.getContext("2d");
        
        // BG color
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_MAX_HEIGHT);
        
        const avatarCanvas = canvasLib.createCanvas(AVATAR_SIZE, AVATAR_SIZE); 
        const avatarCtx = avatarCanvas.getContext("2d");
        const avatar = await canvasLib.loadImage(msg.author.displayAvatarURL({ format: "png" }));
        avatarCtx.drawImage(avatar, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
        // Crop image to circle
        avatarCtx.globalCompositeOperation = "destination-in";
        avatarCtx.beginPath();
        avatarCtx.arc(AVATAR_SIZE / 2, AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
        avatarCtx.closePath();
        avatarCtx.fill();
        context.drawImage(avatarCanvas, 0, 0);
        
        context.fillStyle = "#000000";
        context.font = `${FONT_SIZE}px "Whitney Semibold"`;
        context.textAlign = "left";
        context.fillText(msg.author.username, BODY_TEXT_MARGIN_LEFT, FONT_SIZE);

        const bodyText = msg.cleanContent;
        context.font = `400 ${FONT_SIZE}px "Whitney"`;
        const bodyWidth = CANVAS_WIDTH - BODY_TEXT_MARGIN_LEFT;
        const split = getCanvasWordWrapLines(context, bodyText, bodyWidth);
        for(let i = 0; i < split.length; i++){
            const t = split[i];
            context.fillText(t, BODY_TEXT_MARGIN_LEFT, BODY_TEXT_MARGIN_TOP + ((i + 1) * FONT_SIZE));
        }

        const maxY = Math.max(AVATAR_SIZE, BODY_TEXT_MARGIN_TOP + (split.length * FONT_SIZE) + 5);
        let cropped = context.getImageData(0, 0, canvas.width, maxY);
        canvas.height = maxY;
        context.putImageData(cropped, 0, 0);
        
        const buffer = canvas.toBuffer("image/png");
        try {
            await this.printer.printImageFromBuffer(buffer, "png", DISCORD_ADDS_TO_QUEUE);
        } catch(e) {
            console.error(e);
            return;
        }
        return true;
    }

    isAdmin = (uid) => DISCORD_ADMIN_UIDS.includes(uid);
}
