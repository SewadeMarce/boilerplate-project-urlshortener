require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const cors = require('cors'); // Pour gérer les problèmes de CORS en développement



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Pour analyser les données URL-encoded des formulaires
app.use(bodyParser.json()); // Pour analyser les données JSON des requêtes

const urlDatabase = {};
let shortUrlCounter = 1;

app.post('/api/shorturl', (req, res) => {
    const originalUrl = req.body.url;

    if (!originalUrl) {
        return res.json({ error: 'invalid url' });
    }

    try {
        const parsedUrl = new URL(originalUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return res.json({ error: 'invalid url' });
        }

        // Utilisation de dns.lookup pour vérifier l'existence de l'hôte
        dns.lookup(parsedUrl.hostname, (err, address, family) => {
            if (err || !address) {
                return res.json({ error: 'invalid url' });
            }

            const shortUrl = shortUrlCounter++;
            urlDatabase[shortUrl] = originalUrl;
            res.json({ original_url: originalUrl, short_url: shortUrl });
        });

    } catch (error) {
        return res.json({ error: 'invalid url' });
    }
});

app.get('/api/shorturl/:shorturl', (req, res) => {
    const shortUrl = parseInt(req.params.shorturl);

    if (urlDatabase[shortUrl]) {
        res.redirect(urlDatabase[shortUrl]);
    } else {
        res.status(404).json({ error: 'Short URL not found' });
    }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
