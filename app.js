const http = require('http');
const port = process.env.port || 7000;
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

let app = express();
let server = http.createServer(app);
app.use(bodyParser.json());


async function makeScreenshot(data) {
  data.width = parseInt(data.width || 800);
  data.height = parseInt(data.height || 600);
  let { width, height } = data;
  let browser = await puppeteer.launch({
    headless: true,
    //executablePath: '/opt/google/chrome/chrome',
    executablePath: 'google-chrome-unstable',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', `--window-size=${ width },${ height }`]
  });
  let page = await browser.newPage();
  if (data.url) {
    await page.goto(data.url, { waitUntil: 'networkidle2' });
  } else if (data.html) {
    await page.setContent(data.html);
  }
  let buffer = await page.screenshot();
  await browser.close();
  return { result: buffer.toString('base64') };
}

app.all('/', async (req, res) => {
  try {
    let q = req.method === 'GET' ? JSON.parse(req.query.q) : req.body;
    let r = await makeScreenshot(q);
    res.send(r);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

server.listen(port, () => {
  console.log(`chrome-screenshot started on ${port}`);
});