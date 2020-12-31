import Printer from "./modules/printer.js";
import Server from "./modules/server.js";
import Discord from "./modules/discord.js";

console.log("Starting application...");

const printer = new Printer();
const server = new Server(printer);
const discord = new Discord(printer);