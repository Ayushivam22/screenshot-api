const express = require("express");
const chromium = require("chrome-aws-lambda");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins (change if needed)
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  console.log(`Received request to capture: ${url}`);

  let browser;
  try {
    // Launch browser using chrome-aws-lambda
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || "/usr/bin/google-chrome", // Use AWS Lambda-compatible Chrome
      headless: true,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    console.log("Opening page...");
    await page.goto(url, { waitUntil: "networkidle2" });

    const imagePath = path.join(__dirname, "screenshot.png");
    await page.screenshot({ path: imagePath, fullPage: true });

    console.log("Screenshot taken successfully.");
    
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
    console.error("Error capturing screenshot:", error.stack || error);
    res.status(500).json({ error: "Failed to capture screenshot", details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
