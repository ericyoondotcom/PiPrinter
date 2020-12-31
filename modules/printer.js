import {exec} from "child_process";
import fs from "fs";
import path from "path";
import {escapeForBash, generateUUID} from "./utility.js";

const PRINTER_NAME = "Pi Thermal";

export default class Printer {
    
    constructor(){
        this.dirname = import.meta.url.split(":")[1];
    }

    printStringUsingCUPS(text){
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
}