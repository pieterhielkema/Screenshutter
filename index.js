import express from 'express';
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (request, response) => {
    if(!request.query.url) {
        response.redirect('https://google.nl');
        return;
    }
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();
        await page.goto(request.query.url);
        await page.setViewport({
            width: request.query?.width ? parseInt(request.query.width) : 1500,
            height: request.query?.height ? parseInt(request.query.height) : 700,
            // deviceScaleFactor: 1,
        })
        const image = await page.screenshot({fullPage : true});
        await browser.close();
        response.set('Content-Type', 'image/png');
        response.send(image);
    } catch (error) {
        console.log(error);
    }
});

const listener = app.listen(process.env.PORT || 80, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});