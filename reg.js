import { config } from "dotenv";
import { sleep } from "./utils.js";

config();

export const executeActions = async (page, actions = [], candidates = []) => {
    for (const candidate of candidates) {
        await page.reload({ waitUntil: "domcontentloaded" });

        await page.evaluate(async (actions, candidate, submitSelector) => {
            for (const action of actions) {
                if (action.type === "input" || action.type === "change") {
                    const element = document.querySelector(action.selector);
                    if (element) {
                        element.value = candidate[action.value];
                        element.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                }

                if (action.type === "click" || action.type === "submit" || ["yes", "no"].includes(action.value.toLowerCase())) {
                    const element = document.querySelector(action.selector);
                    if (action.value && action.value === "yes") continue;

                    if (element) {
                        element.click();
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
            }

            // const submitButton = document.querySelector(submitSelector);
            // if (submitButton) {
            //     submitButton.click();
            // }

            await new Promise(resolve => setTimeout(resolve, 1700));
        }, actions, candidate, process.env.SUBMIT_FORM_BTN_SELECTOR);

        const frames = page.frames();
        let captchaButtonFound = false;

        if (!frames || !frames?.length) continue;

        for (const frame of frames) {
            if (frame.url().includes(process.env.CAPTCHA_IFRAME_URL)) {
                try {
                    const captchaButton = await frame.waitForSelector(process.env.CAPTCHA_FORM_BTN_SELECTOR, { timeout: 1200 });
                    if (captchaButton) {
                        await captchaButton.click();
                        captchaButtonFound = true;
                        break;
                    }
                } catch (err) {
                    console.error("Solve captcha button hasn't been found in this frame frame : ", err);
                }
            }
        }

        if (!captchaButtonFound) {
            console.er("Solve captcha button hasn't been found in any frame :( ");
        }

        await sleep(.4);
    }
};