const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("home", { elements: {} });
});

const scrapeElements = ($, scrapeAllElements) => {
    const fields = {};
    if (!scrapeAllElements) {
        $('input[type="email"]').each(
            (i, element) => (fields.email = $(element.parent).html())
        );
        $('input[type="text"]').each(
            (i, element) => (fields.username = $(element.parent).html())
        );
        $('input[type="password"]').each(
            (i, element) => (fields.password = $(element.parent).html())
        );
    } else {
        fields.allInputElements = [];
        $('input').each(
            (i, element) => fields.allInputElements.push($(element.parent).html())
        );
    }

    return fields;
};

app.post("/scrape", async (req, res) => {
    console.log(`Scraping ${req.body.urlToScrape} | scrapeAllElements: ${req.body.scrapeAllElements}`);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(req.body.urlToScrape, {
        waitUntil: "networkidle0",
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    await browser.close();

    const scrapedElements = scrapeElements($, req.body.scrapeAllElements);
    console.log(scrapedElements);

    return res.status(200).json(scrapedElements);
});

app.listen(3000, function () {
    console.log("Server started on port: 3000");
});
