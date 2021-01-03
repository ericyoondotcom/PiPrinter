import {exec} from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import {escapeForBash, generateUUID} from "./utility.js";

const PRINTER_NAME = "Pi Thermal";

export default class Printer {
    
    constructor(){
        this.dirname = import.meta.url.split(":")[1];
    }

    printString(text){
        const jobId = generateUUID();
        return new Promise((resolve, reject) => {
            const tempPath = path.normalize(`${this.dirname}/../../.temp-queue/${jobId}.txt`);
            fs.writeFile(tempPath, text, (err1) => {
                if(err1){
                    console.error(err1);
                    reject(err1);
                    return;
                }
                exec(`lp -o fit-to-page -t ${jobId} ${tempPath}`, (err2, stdout, stderr) => {
                    if(err2){
                        console.error(err2);
                        reject(err2);
                        return;
                    }
                    fs.unlink(tempPath, (err3) => {
                        if(err3) {
                            console.error(err3);
                            reject(err3);
                            return;
                        }
                        resolve();
                    });
                });
            });
        });
    }

    /**
     * Prints an image using CUPS.
     * @param {*} buffer The raw data buffer of the image.
     * @param {*} extension The file type the image data is in, for example "png"
     */
    printImageFromBuffer(buffer, extension){
        const jobId = generateUUID();
        return new Promise((resolve, reject) => {
            const tempPath = path.normalize(`${this.dirname}/../../.temp-queue/${jobId}.${extension}`);
            fs.writeFile(tempPath, buffer, (err1) => {
                if(err1){
                    console.error(err1);
                    reject(err1);
                    return;
                }
                exec(`lp -o fit-to-page -o orientation-requested=3 -t ${jobId} ${tempPath}`, (err2, stdout, stderr) => {
                    if(err2){
                        console.error(err2);
                        reject(err2);
                        return;
                    }
                    fs.unlink(tempPath, (err3) => {
                        if(err3) {
                            console.error(err3);
                            reject(err3);
                            return;
                        }
                        resolve();
                    });
                });
            });
        });
    }

    async printImageFromURL(url){
        const extension = url.split('.').pop();
        const res = await fetch(url);
        const buffer = await res.buffer();
        return await this.printImageFromBuffer(buffer, extension);
    }
}