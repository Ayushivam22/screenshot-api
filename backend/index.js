const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async (req, res) => {
    try {
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

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath() || '/usr/bin/google-chrome',
            headless: chromium.headless
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Capture screenshot as JPEG
        const screenshot = await page.screenshot({ type: "jpeg", quality: 80 });

        await browser.close();

        // Set response headers to trigger download
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="screenshot.jpg"');

        res.send(screenshot);

    } catch (error) {
        res.status(500).json({
            error: "Error capturing screenshot",
            details: error.message
        });
    }
};
