# Sloth - Automated registration process

This script automates the user registration process on any website including bypassing CAPTCHA. The user will manually fill out one registration form, and the script will replicate these actions for additional data entries.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Script Overview](#script-overview)
- [Key Components](#key-components)
- [License](#license)

## Features

- **User Registration Automation**: Automates the registration process by recording user actions.
- **CAPTCHA Bypass**: Attempts to handle CAPTCHA challenges during the registration process.
- **Data Handling**: Uses Google Sheets to manage candidate data for registration.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable network applications.
- **Puppeteer**: A Node library for controlling headless Chrome or Chromium.
- **Google Sheets API**: For accessing and managing candidate data.

## Getting Started

To get a local copy up and running, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shheeeeshka/sloth-registration-service.git

2. **Navigate to the project directory**:
   ```bash
   cd sloth-registration-service

3. **Install dependencies**:
   ```bash
   npm install

4. **Set up environment variables**:
    ```
    TARGET_URL=https://clck.ru/3Fk6hp
    SHOW_BROWSER=1
    SPREADSHEET_ID=1KjMLJVdPUvRF0yTcLAqHEYL9mXqVSzlcWvL1URwwgzE

    SUBMIT_FORM_BTN_SELECTOR="#form817014283>div.t-form__inputsbox>div.tn-form__submit>button"
    CAPTCHA_FORM_BTN_SELECTOR="#js-button"

    CAPTCHA_IFRAME_URL=https://smartcaptcha.yandexcloud.net
    ```

5. **Start the server**:
   ```bash
   npm start

## Script Overview

The script uses Puppeteer to launch a Chrome browser and record user actions during the registration process. After the user fills out the first form, the script will replicate these actions for other candidates' data retrieved from a Google Sheet.

## Key Components

- **Action Recording**: The script records clicks, inputs, and changes made by the user.
- **Data Retrieval**: It fetches candidate data from a specified Google Sheet.
- **Action Execution**: The recorded actions are executed for each candidate, with a delay of approximately 5-7 seconds per form submission to mimic human behavior.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.