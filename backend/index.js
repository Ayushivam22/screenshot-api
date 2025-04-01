const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://screenshot-api-ixpy.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  console.log(`Received request to capture: ${url}`);

  try {
    const browser = await puppeteer.launch({
      args: chromium.args, // Use arguments that allow Chromium to run in serverless environments
      executablePath: await chromium.executablePath, // Path to the Chromium binary provided by chrome-aws-lambda
      headless: chromium.headless, // Run in headless mode
    });

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
