const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/screenshot", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    console.log(`Received request to capture: ${url}`);

    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        console.log("Opening page...");
        await page.goto(url, { waitUntil: "networkidle2" });

        const imagePath = path.join(__dirname, "screenshot.png");
        await page.screenshot({ path: imagePath, fullPage: true });

        console.log("Screenshot taken successfully.");
        await browser.close();

        res.setHeader("Content-Disposition", "attachment; filename=screenshot.png");
        res.setHeader("Content-Type", "image/png");

        const fileStream = fs.createReadStream(imagePath);
        fileStream.pipe(res);

        fileStream.on("end", () => {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting file:", err);
            });
        });

    } catch (error) {
        console.error("Error capturing screenshot:", error);
        res.status(500).json({ error: "Failed to capture screenshot", details: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
