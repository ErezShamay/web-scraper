import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost/web-scraper', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const DataSchema = new mongoose.Schema({
    title: String,
    link: String,
});
const ScrapedData = mongoose.model('ScrapedData', DataSchema);

const scrapeWebsite = async () => {
    const url = 'https://www.example.co.il/';
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const scrapedData = [];
        $('script.src').each((i, element) => {
            const title = $(element).text().trim();
            const link = $(element).attr('href');
            scrapedData.push({ title, link });
        });

        console.log('Scraped Data:', scrapedData);

        fs.writeFileSync('scrapedData.json', JSON.stringify(scrapedData, null, 2));
        console.log('Data saved to scrapedData.json');

        await ScrapedData.insertMany(scrapedData);
        console.log('Data saved to MongoDB');
    } catch (error) {
        console.error('Error scraping the website:', error);
    }
};

const main = async () => {
    await connectDB();
    await scrapeWebsite();
    mongoose.disconnect();
};

main();