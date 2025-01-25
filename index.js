import puppeteer from "puppeteer";

import { config } from "dotenv";
import { google } from "googleapis";

import { getFinalActions, sleep } from "./utils.js";
import { executeActions } from "./reg.js";

config();

const getInitSpreadsheetData = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();

        const googleSheets = google.sheets({ version: "v4", auth: client });

        const spreadsheetId = process.env.SPREADSHEET_ID;

        const metaData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId,
        });

        const { data } = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Лист1",
        });

        return data;
    } catch (err) {
        console.error(`An error occurred while connecting to google api : ${err.message}`);
        throw err;
    }
};

const main = async () => {
    try {
        const data = await getInitSpreadsheetData();

        const spreadsheetValues = data.values;
        console.log(spreadsheetValues);

        const headers = spreadsheetValues[1];

        const candidates = spreadsheetValues.slice(2).map(row => {
            const candidateObject = {};
            row.forEach((value, index) => {
                candidateObject[headers[index]] = value;
            });
            return candidateObject;
        });

        console.log(candidates);

        // const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        const browser = await puppeteer.launch({
            headless: process.env.SHOW_BROWSER === "1" ? false : true,
            defaultViewport: false,
            timeout: 0,
            userDataDir: "./tmp",
            // executablePath,
        });
        const page = await browser.newPage();
        await page.goto(process.env.TARGET_URL);

        const actions = [];

        await page.exposeFunction("recordClick", (selector) => {
            actions.push({ type: "click", selector });
            console.log(actions);
        });

        await page.exposeFunction("recordInput", (selector, value) => {
            actions.push({ type: "input", selector, value });
            console.log(actions);
        });

        await page.exposeFunction("recordChange", (selector, value) => {
            actions.push({ type: "change", selector, value });
            console.log(actions);
        });

        await page.exposeFunction("recordSubmit", (selector) => {
            actions.push({ type: "submit", selector });
            console.log(actions);
        });

        await page.evaluate(() => {
            const getSelector = (element) => {
                if (!(element instanceof Element)) return null;

                const path = [];
                while (element) {
                    let selector = element.nodeName.toLowerCase();
                    if (element.id) {
                        selector += `#${element.id}`;
                        path.unshift(selector);
                        break;
                    } else {
                        let sibling = element;
                        let nth = 1;
                        while ((sibling = sibling.previousElementSibling)) {
                            if (sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) {
                                nth++;
                            }
                        }
                        selector += `:nth-of-type(${nth})`;
                    }
                    path.unshift(selector);
                    element = element.parentElement;
                }
                return path.join(" > ");
            };

            const changeHandler = (event) => {
                const target = event.target.closest("select");
                if (target) {
                    const selector = getSelector(target);
                    window.recordChange(selector, target.value);
                }
            };

            const clickHandler = (event) => {
                const target = event.target.closest("input, button, textarea");
                if (target) {
                    const selector = getSelector(target);
                    window.recordClick(selector);
                }
            };

            const inputHandler = (event) => {
                const target = event.target.closest("input, textarea");
                if (target) {
                    const selector = getSelector(target);
                    window.recordInput(selector, target.value);
                }
            };

            const submitHandler = (event) => {
                const form = event.target.closest("form");
                if (form) {
                    const selector = getSelector(form);
                    window.recordSubmit(selector);
                }
            };

            document.addEventListener("click", clickHandler);
            document.addEventListener("input", inputHandler);
            document.addEventListener("change", changeHandler);
            document.addEventListener("submit", submitHandler);

            window.removeEventListeners = () => {
                document.removeEventListener("click", clickHandler);
                document.removeEventListener("input", inputHandler);
                document.removeEventListener("change", changeHandler);
                document.removeEventListener("submit", submitHandler);
            };
        });

        await sleep(30);
        await page.evaluate(() => {
            window.removeEventListeners();
        });

        console.log(getFinalActions(actions));

        try {
            await executeActions(page, getFinalActions(actions), candidates);
        } catch (err) {
            console.error(err);
        }

        await sleep(20);
        await browser.close();
    } catch (err) {
        console.error(err);
    }
};

main();