const express = require('express');
const path = require('path');
const PORT = 3000;
const HOST = '0.0.0.0';
require('dotenv').config();

const redisRouter = require('./routes/redis');
const s3Router = require('./routes/s3');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/redis', redisRouter);
app.use('/s3', s3Router);

app.listen(PORT, HOST, () =>
	console.log(`Listening on port ${HOST}:${PORT}......`)
);
