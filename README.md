# PiPrinter
Custom server code for a Raspberry Pi [Thermal Printer](https://www.adafruit.com/product/2751) project.
- API: Web API to print stuff!
- Website: React web interface!
- Discord integration: print out all messages sent to a channel!

3D files for 3D-printed housing available in `/CAD` directory

## Getting Started
1. Install modules: `npm install`
2. Copy secrets file and edit values: `cp config.template.js config.js`
3. Create a directory where temporary files created by the server go: `mkdir .temp-queue`
4. Set up React environment: inside the `/web` directory, `npm install` and `npm run build`
5. Start the server: `npm start`

## Setting Up the Physical Printer
Generally, I followed [this guide](https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/overview), but there are a few things that you should know:
- If you are using a USB connection and gibberish comes out (see [this forum post](https://forums.adafruit.com/viewtopic.php?f=19&t=160866)), the baud rate is most likely incorrect. There is no easy way of fixing this if you use the `usb:` protocol as specified in the guide. However, if you use the `serial:` protocol (even if you're not using the serial GPIO ports for communication!) you can specify the baud rate like so:
```
serial:/dev/usb/lp0?baud=9600
```
(This is the printer URI that worked for me, but your path and baud rate may vary)