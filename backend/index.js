const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

async function captureScreenshot(url) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshot = await page.screenshot();
    await browser.close();

    return screenshot;
}

module.exports = captureScreenshot;
