import {exec} from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import {escapeForBash, generateUUID} from "./utility.js";
import {PRINTER_NAME} from "../config.js";

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
                exec(`lp -d ${PRINTER_NAME} -o fit-to-page -t ${jobId} ${tempPath}`, (err2, stdout, stderr) => {
                    console.log(stdout);
                    console.error(stderr);
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
    printImageFromBuffer(buffer, extension, addToQueue){
        const jobId = generateUUID();
        return new Promise((resolve, reject) => {
            const tempPath = path.normalize(`${this.dirname}/../../.temp-queue/${jobId}.${extension}`);
            fs.writeFile(tempPath, buffer, (err1) => {
                if(err1){
                    console.error(err1);
                    reject(err1);
                    return;
                }
                if(addToQueue === true){
                    resolve();
                    return;
                }
                exec(`lp -d ${PRINTER_NAME} -o fit-to-page -o orientation-requested=3 -t ${jobId} ${tempPath}`, (err2, stdout, stderr) => {
                    console.log(stdout);
                    console.error(stderr);
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

    async printImageFromURL(url, addToQueue){
        const extension = url.split('.').pop();
        let res;
        try {
            res = await fetch(url);
        } catch(e) {
            console.error(e);
            throw new Error("Error fetching file from URL.");
        }
        const buffer = await res.buffer();
        return await this.printImageFromBuffer(buffer, extension, addToQueue);
    }

    async flushQueue(){
        return new Promise((resolve, reject) => {
            const tempPath = path.normalize(`${this.dirname}/../../.temp-queue`);
            fs.readdir(tempPath, (err1, files) => {
                if(err1){
                    console.error(err1);
                    reject(err1);
                    return;
                }
                files = files.map(i => path.normalize(`${tempPath}/${i}`));
                files = files.sort((a, b) => {
                    const timeA = fs.statSync(a).mtime.getTime();
                    const timeB = fs.statSync(b).mtime.getTime();
                    return timeA - timeB;
                });
                Promise.allSettled(files.map(fullPath => {
                    return new Promise((resolve, reject) => {
                        exec(`lp -d ${PRINTER_NAME} -o fit-to-page -o orientation-requested=3 ${fullPath}`, (err2, stdout, stderr) => {
                            console.log(stdout);
                            console.error(stderr);
                            if(err2){
                                console.error(err2);
                                reject(err2);
                                return;
                            }
                            fs.unlink(fullPath, (err3) => {
                                if(err3) {
                                    console.error(err3);
                                    reject(err3);
                                    return;
                                }
                                resolve();
                            });
                        });
                    });
                })).then(resolve, reject);
            });
        });
    }

    async cancelAllJobs(){
        return new Promise((resolve, reject) => {
            exec(`cancel -a ${PRINTER_NAME}`, (err, stdout, stderr) => {
                console.log(stdout);
                console.error(stderr);
                if(err){
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}