import Printer from "./modules/printer.js";
import Server from "./modules/server.js";
import Calendar from "./modules/calendar.js";
import Discord from "./modules/discord.js";

console.log("Starting application...");

const printer = new Printer();
const calendar = new Calendar(printer);
const server = new Server(printer, calendar);
const discord = new Discord(printer);