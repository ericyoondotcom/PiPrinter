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

// Any image sent from discord with an aspect ratio (width/height) less than this will be rejected. Set to 0 for no limit
export const MINIMUM_IMAGE_ASPECT = 1 / 2;