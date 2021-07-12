# PiPrinter
Custom server code for a Raspberry Pi [Thermal Printer](https://www.adafruit.com/product/2751) project.
- API: Web API to print stuff!
- Website: React web interface!
- Discord integration: print out all messages sent to a channel!

3D files for 3D-printed housing available in `/CAD` directory

## Getting Started
1. Install modules: `npm install`
2. Copy secrets file and edit values: `cp config.template.js config.js`.
3. Make up at least one access token and put it in `API_ACCESS_TOKENS` so you can use the web interface. To set up integrations, read below.
4. Create a directory where temporary files created by the server go: `mkdir .temp-queue`
5. Set up React environment: inside the `/web` directory, `npm install` and `npm run build`
6. Start the server: (from the root directory) `npm start`

## Setting Up the Physical Printer
Generally, I followed [this guide](https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/overview), but there are a few things that you should know:
- If you are using a USB connection and gibberish comes out (see [this forum post](https://forums.adafruit.com/viewtopic.php?f=19&t=160866)), the baud rate is most likely incorrect. There is no easy way of fixing this if you use the `usb:` protocol as specified in the guide. However, if you use the `serial:` protocol (even if you're not using the serial GPIO ports for communication!) you can specify the baud rate like so:
```
serial:/dev/usb/lp0?baud=9600
```
(This is the printer URI that worked for me, but your path and baud rate may vary)

## Setting Up Discord Integration
1. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications).
2. Copy the bot's token and paste it in `DISCORD_TOKEN` in `config.js`.
3. Invite your bot to your server by navigating to this URL, inserting your bot's Client ID: `https://discord.com/oauth2/authorize?scope=bot&client_id=PASTE_YOUR_CLIENT_ID_HERE&permissions=8`
4. Copy the ID of any Discord channels you want messages to be printed out from, and paste them in the `ALLOWED_DISCORD_CHANNELS` array in `config.js`.

## Setting Up Google Calendar integration
1. Follow the [Create Desktop application credentials](https://developers.google.com/workspace/guides/create-credentials#desktop) guide and save the JSON client secret file as `google_credentials.json`.
2. Make sure to enable the Google Calendar API in the Google Cloud API Library.
3. Include the IDs of the calendars you want to include in the `CALENDAR_IDS` field of `config.js`. You can find your Calendars' IDs in the "Integrate calendar" section of Calendar settings.
4. Start up your server, navigate to the web dashboard, and click `Print agenda` to link your account! You will only have to complete the linking process once.
