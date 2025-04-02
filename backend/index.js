const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle Preflight OPTIONS Request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "Missing URL parameter" });
    }

    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath() || '/usr/bin/google-chrome',
            headless: chromium.headless
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        const screenshot = await page.screenshot({ encoding: "base64" });
        await browser.close();

        res.status(200).json({ screenshot });
    } catch (error) {
        res.status(500).json({ error: "Error capturing screenshot", details: error.message });
    }
};
