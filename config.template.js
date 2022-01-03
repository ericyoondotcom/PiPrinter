// The name of your printer device. To get a list of CUPS printer, use `$ lpstat -p -d`
export const PRINTER_NAME = "";

export const DISCORD_TOKEN = "XXXXX";

// A list of valid access tokens that clients can use to interact with the API.
export const API_ACCESS_TOKENS = [
    // "XXXXX"
];

// A list of Discord channel IDs that the bot should print messages from.
export const ALLOWED_DISCORD_CHANNELS = [

];

// The maximum height of Discord fancy message printouts.
export const MAX_DISCORD_MESSAGE_HEIGHT = 110;

// The time required to wait before a user sends another message, in millis.
export const DISCORD_RATE_LIMIT = 30 * 60 * 1000;

// A lit of Discord user IDs of admins who can bypass rate limits.
export const DISCORD_ADMIN_UIDS = [
    
];

// Set to true to have Discord messages added to a queue to be printed out when it's flushed.
export const DISCORD_ADDS_TO_QUEUE = true;

// The user to DM whenever a print job is added via Discord. Set to "" to disable.
export const DISCORD_NOTIFICATION_USER = "267088700373073920";

// Any image sent from discord with an aspect ratio (width/height) less than this will be rejected. Set to 0 for no limit
export const MINIMUM_IMAGE_ASPECT = 1 / 2;

// A cron schedule for when the daily calendar agenda should automatically print out. Set to an empty string to disable automatic printing.
export const CALENDAR_AUTO_PRINTOUT_SCHEDULE = "30 7 * * 1-5";

// A list of Google Calendar IDs to fetch events from.
export const CALENDAR_IDS = [];