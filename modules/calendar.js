import gapi from "googleapis";
const {google} = gapi;
import canvasLib from "canvas";
import schedule from "node-schedule";
import fs from "fs";
import moment from "moment";
import {CALENDAR_IDS, CALENDAR_AUTO_PRINTOUT_SCHEDULE} from "../config.js";
import { getCanvasWordWrapLines } from "./utility.js";

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CANVAS_SCALE = 10;
const CANVAS_WIDTH = 220 * CANVAS_SCALE;
const CANVAS_MAX_HEIGHT = 1000 * CANVAS_SCALE;
const FONT_SIZE = 16 * CANVAS_SCALE;
const BODY_TEXT_MARGIN_TOP = 17 * CANVAS_SCALE

export default class Calendar {
    /**
     * @param {Printer} printer 
     */
    constructor(printer){
        this.printer = printer;
        this.loadCredentials().then(() => {
            this.tryAuthorize().then(() => {
                console.log("Logged in to Calendar");
            });
        });

        if(CALENDAR_AUTO_PRINTOUT_SCHEDULE.length > 0){
            this.scheduledJob = schedule.scheduleJob(CALENDAR_AUTO_PRINTOUT_SCHEDULE, () => {
                this.printSchedule();
            });
        }
    }

    accessTokenObtained = false;
    credentials = null;
    auth = null;

    loadCredentials = () => {
        return new Promise((resolve, reject) => {
            fs.readFile("google_credentials.json", (err, data) => {
                if(err){
                    console.error(err);
                    reject(err);
                    return;
                }
                this.credentials = JSON.parse(data);
                resolve();
                return;
            });
        });
    }

    tryAuthorize = () => {
        const {client_secret, client_id, redirect_uris} = this.credentials.installed;
        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        return new Promise((resolve, reject) => {
            fs.readFile("google_token.json", (err, token) => {
                if (err){
                    console.log("Access token has not been obtained yet!");
                    reject(err);
                    return;
                }
                this.auth.setCredentials(JSON.parse(token));
                this.accessTokenObtained = true;
                resolve();
            });
        });
    }

    /**
     * Gets the authentication flow URL to display to the user.
     * @returns The URL to display to the user
     */
    getAuthURL = () => {
        return this.auth.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES
        });
    }

    /**
     * Finishes authentication after the user navigates to the auth URL.
     * @param {*} code The code pasted by the user
     */
    completeAuthFlow = async (code) => {
        let token = (await this.auth.getToken(code)).tokens;
        this.auth.setCredentials(token);
        this.accessTokenObtained = true;
        await new Promise((resolve, reject) => {
            fs.writeFile("google_token.json", JSON.stringify(token), (err) => {
                if(err){
                    reject(err);
                    return;
                }
                console.log("Authorized! Saved new token to disk.");
                resolve();
            });
        });
    }

    printSchedule = async () => {
        if(!this.accessTokenObtained){
            throw new Error("Not authorized yet");
        }
        const calendar = google.calendar({version: "v3", auth: this.auth});
        const now = new Date();
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const promises = CALENDAR_IDS.map((cal) => {
            return new Promise((resolve, reject) => {
                calendar.events.list({
                    calendarId: cal,
                    timeMin: now.toISOString(),
                    timeMax: endTime.toISOString(),
                    maxResults: 50,
                    singleEvents: true,
                    orderBy: "startTime",
                }).then(list => {
                    resolve(list);
                }, e => {
                    console.error(e);
                    reject(e);
                });
            });
        });

        const events = (await Promise.allSettled(promises))
            .filter(i => i.status == "fulfilled")
            .map(i => i.value.data.items)
            .flat()
            .map(i => {
                return {
                    name: i.summary,
                    allDay: i.start.dateTime == null,
                    start: (i.start.dateTime == null) ? moment(i.start.date) : moment(i.start.dateTime),
                    end: (i.end.dateTime == null) ? moment(i.end.date) : moment(i.end.dateTime),
                    location: i.location,
                    id: i.id
                };
            });
        events.sort((a, b) => a.start.valueOf() - b.start.valueOf());
        const allDayEvents = events.filter(i => i.allDay);
        const timeEvents = events.filter(i => !i.allDay);

        let string = "";
        for(let i of allDayEvents){
            string += `\n• ${i.name}`;
            if(i.location != undefined) string += " | " + i.location;
        }
        if(allDayEvents.length > 0 && timeEvents.length > 0){
            string += "\n---"
        }
        for(let i of timeEvents){
            string += `\n• ${i.start.format("h:mma")} | ${i.name}`;
            if(i.location != undefined) string += " | " + i.location;
        }
        string += "\n\nHave a good day!\n";
        
        const canvas = canvasLib.createCanvas(CANVAS_WIDTH, CANVAS_MAX_HEIGHT);
        const context = canvas.getContext("2d");
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_MAX_HEIGHT);
        context.fillStyle = "#000000";
        context.font = `${FONT_SIZE}px "Whitney Semibold"`;
        context.textAlign = "left";
        context.fillText(moment().format("dddd, MMM Do, YYYY"), 0, FONT_SIZE);
        context.font = `400 ${FONT_SIZE}px "Whitney"`;
        
        const split = getCanvasWordWrapLines(context, string, CANVAS_WIDTH);
        for(let i = 0; i < split.length; i++){
            const t = split[i];
            context.fillText(t, 0, BODY_TEXT_MARGIN_TOP + ((i + 1) * FONT_SIZE));
        }
        const maxY = BODY_TEXT_MARGIN_TOP + (split.length * FONT_SIZE) + 5;
        let cropped = context.getImageData(0, 0, canvas.width, maxY);
        canvas.height = maxY;
        context.putImageData(cropped, 0, 0);
        const buffer = canvas.toBuffer("image/png");

        try {
            // await this.printer.printString(string);
            await this.printer.printImageFromBuffer(buffer, "png");
        } catch(e) {
            console.error(e);
            return;
        }
    }
}