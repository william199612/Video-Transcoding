const AWS = require('aws-sdk');
const redis = require('redis');
const express = require('express');
const router = express.Router();
const fs = require('fs');

AWS.config.update({
	region: 'ap-southeast-2',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	sessionToken: process.env.AWS_SESSION_TOKEN,
});

const bucketName = process.env.BUCKET_NAME;
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Initialize Redis client
// const redis = new Redis({
// 	host: 'localhost',
// 	port: 6379
// });

const client = redis.createClient();

s3.createBucket({ Bucket: bucketName })
	.promise()
	.then(() => console.log(`Created bucket: ${bucketName}`))
	.catch((err) => {
		// Ignore 409 errors which indicate that the bucket already exists
		if (err.statusCode !== 409) {
			console.log(`Error creating bucket: ${err}`);
		}
	});

router.post('/saveCache', async (req, res, next) => {
	const { fileUrl } = req.body;
	client.on('error', err => console.log(`Redis Client Error!! ${err}`));

	// Check whether is connected
	if (!client.isReady) await client.connect();

	const result = await client.set('fileUrl', fileUrl, 60);
	await client.quit();
	if (result === 'OK') {
		return res.status(200).json({
			success: true
		});
	} else {
		return res.status(500).json({
			success: false,
			errMsg: 'Occur Error When saving data to Redis!!!'
		});
	}
});

router.post('/getCache', async (req, res, next) => {
	client.on('error', (err) => {
		console.log(`Redis Client Error!! ${err}`);
		return res.status(500).json({
			success: false,
			errMsg: err
		});
	});

	// Check whether is connected
	if (!client.isReady) await client.connect();
	const redisResult = await client.get('fileUrl');
	await client.quit();
	
	if (redisResult) {
		return res.status(200).json({
			success: true,
			haveCache: true,
			url: redisResult
		});
	} else {
		return res.status(200).json({
			success: true,
			haveCache: false
		});
	}

});

module.exports = router;
