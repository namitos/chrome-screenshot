const http = require('http');
const port = process.env.port || 7000;
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

let app = express();
let server = http.createServer(app);
app.use(bodyParser.json());

const wait = (ms) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms);
})


async function makeScreenshot(data) {
  data.width = parseInt(data.width || 800);
  data.height = parseInt(data.height || 600);
  data.type = data.type || 'buffer';
  console.log(data.width, data.height);

  let { width, height } = data;
  let browser = await puppeteer.launch({
    headless: true,
    //executablePath: '/opt/google/chrome/chrome',
    executablePath: 'google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', `--window-size=${ width },${ height }`]
  });
  let page = await browser.newPage();
  await page.setViewport({ width, height });
  if (data.url) {
    await page.goto(data.url, { waitUntil: 'networkidle2' });
  } else if (data.html) {
    await page.setContent(data.html);
  }
  if (data.wait) {
    await wait(data.wait);
  }
  let buffer = await page.screenshot();
  await browser.close();
  return { buffer };
}

app.all('/', async (req, res) => {
  try {
    let q = req.method === 'GET' ? JSON.parse(req.query.q) : req.body;
    let { buffer } = await makeScreenshot(q);
    res.send({ result: buffer.toString('base64') });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

server.listen(port, () => {
  console.log(`chrome-screenshot started on ${port}`);
});