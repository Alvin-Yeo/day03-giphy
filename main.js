// Load modules
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// Configure the environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const API_KEY = process.env.API_KEY || "";
const URL = 'https://api.giphy.com/v1/gifs/search';

// Create an instance of express
const app = express();

// Configure handlebars
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }));
app.set('view engine', 'hbs');

// Configure the app
app.get(['/', '/index.html'], (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('blank');
});

app.get('/search', async (req, res) => {
    const search = req.query['to-search'];
    console.info('Search term: ', search);

    // Search giphy
    let result;
    let gifs;

    const ENDPOINT = withQuery(URL, {
        api_key: API_KEY,
        q: search,
        limit: 9,
        rating: 'g'
    });
    console.info('Endpoint: ', ENDPOINT)

    try {
        result = await fetch(ENDPOINT);
        gifs = await result.json();
        // console.info('Data: ', gifs);
    } catch(err) {
        console.error('Error: ', err);
        // return Promise.reject(err);
    }

    const dataArr = gifs.data;
    const gifsUrlArr = dataArr.map(data => data.images.original.url);
    
    // console.log('gifsArr: ', gifsArr);

    res.status(200);
    res.type('text/html');
    res.render('result', {
        search,
        gifsUrlArr
    });
});

// Static resources
app.use(express.static(__dirname + '/static'));

// Start server
if(API_KEY)
    app.listen(PORT, () => {
        console.info(`Application started on port ${PORT} at ${new Date()}`);
        console.info(`Key: ${API_KEY}`);
    });
else 
    console.error('API_KEY not found.');
