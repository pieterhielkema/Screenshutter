import express from 'express';
import puppeteer from "puppeteer";
import NodeCache from "node-cache";

const app = express();
const cache = new NodeCache();

app.get("/", async (request, response) => {
    if(!request.query.url || !isValidUrl(request.query.url)) {
        response.redirect('https://pieterhielkema.nl');
        return;
    }

    const image = cache.get( "page_" + request.query.url);
    if(image) {
        response.set('Content-Type', 'image/png');
        response.send(image);
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

        cache.set( "page_" + request.query.url, image, 10000 );

        response.set('Content-Type', 'image/png');
        response.send(image);
    } catch (error) {
        console.log(error);
    }
});

const listener = app.listen(process.env.PORT || 80, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
listener.setTimeout(10000);

const isValidUrl = (urlString) => {
    try {
        return Boolean(new URL(urlString));
    }
    catch(e){
        return false;
    }
}