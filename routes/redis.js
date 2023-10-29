const AWS = require('aws-sdk');
const Redis = require('redis');
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
const redis = new Redis({
	host: 'localhost',
	port: 6379,
});

s3.createBucket({ Bucket: bucketName })
	.promise()
	.then(() => console.log(`Created bucket: ${bucketName}`))
	.catch((err) => {
		// Ignore 409 errors which indicate that the bucket already exists
		if (err.statusCode !== 409) {
			console.log(`Error creating bucket: ${err}`);
		}
	});

// TODO: rewrite this section to save the result in cache and S3
router.post('', async (req, res, next) => {
	// TODO: change key name
	const key = req.query.key.trim();
	const cacheKey = `video:${key}`; // Redis cache key
	const s3Key = `video-${key}`; // S3 key

	// Check Redis Cache
	redis.get(cacheKey, (redisErr, redisResult) => {
		if (redisErr) {
			console.error(`Redis Error: ${redisErr}`);
		}

		if (redisResult) {
			// Serve from Redis Cache
			const resultJSON = JSON.parse(redisResult);
			res.json({ source: 'Redis Cache', ...resultJSON });
			console.log('Serve the result from Cache');
		} else {
			// Check S3
			const s3Params = { Bucket: bucketName, Key: s3Key };

			s3.getObject(s3Params)
				.promise()
				.then((s3Result) => {
					// Serve from S3
					const s3ResultJSON = JSON.parse(s3Result.Body);
					res.json({
						source: 'S3 Bucket',
						...s3ResultJSON,
					});
					console.log('Serve the result from S3');

					// Store in Redis Cache
					redis.set(
						cacheKey,
						JSON.stringify({
							source: 'Redis Cache',
							...s3ResultJSON,
						})
					);
					console.log('Saving the result to Cache');
				})
				.catch((s3Err) => {
					// TODO: remove this section
					if (s3Err.statusCode === 404) {
						// Serve from Wikipedia API and store in S3 and Redis Cache
						const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${key}`;
						axios
							.get(searchUrl)
							.then((response) => {
								const responseJSON = response.data;
								const body = JSON.stringify({
									source: 'S3 Bucket',
									...responseJSON,
								});

								const objectParams = {
									Bucket: bucketName,
									Key: s3Key,
									Body: body,
								};
								s3.putObject(objectParams)
									.promise()
									.then(() => {
										console.log(
											`Successfully uploaded data to ${bucketName}/${s3Key}`
										);

										// Serve from Wikipedia API response and store in Redis Cache
										res.json({
											source: 'Wikipedia API',
											...responseJSON,
										});
										redis.set(
											cacheKey,
											JSON.stringify({
												source: 'Redis Cache',
												...responseJSON,
											})
										);
										console.log(
											'Serve from Wikipedia API and store in S3 and Redis Cache'
										);
									});
							})
							.catch((apiErr) => res.json(apiErr));
					} else {
						// Something else went wrong when accessing S3
						res.json(s3Err);
					}
				});
		}
	});
});

module.exports = router;
