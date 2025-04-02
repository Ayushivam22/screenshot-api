import puppeteer from 'puppeteer';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/screenshot', async (req, res) => {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://screenshot-api-ixpy.vercel.app/', { waitUntil: 'networkidle2' });

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Capture the screenshot as a buffer
    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    // Set headers and send the image
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
