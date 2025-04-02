const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/screenshot", async (req, res) => {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
            executablePath: await chromium.executablePath() || "/usr/bin/google-chrome",
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Take Screenshot
        const screenshot = await page.screenshot({ type: "jpeg" });
        await browser.close();

        // Send correct headers for binary image transfer
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Content-Disposition", "attachment; filename=screenshot.jpg");
        res.send(screenshot); // Sending raw binary data

    } catch (error) {
        res.status(500).json({
            error: "Error capturing screenshot",
            details: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
