const AWS = require('aws-sdk');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// create s3 bucket
async function createS3bucket(s3, bucket) {
	console.log('Creating Bucket...');
	try {
		console.log(bucketName);
		await s3
			.createS3bucket({ Bucket: bucketName })
			.promise();
		console.log(`Created bucket: ${bucketName}`);
		return s3;
	} catch (e) {
		if (e.statusCode == 409) {
			console.log(`${bucketName} already exist!`);
		} else {
			console.log(`Error during creating bucket: ${e}`);
		}
	}
}

// upload json data to s3
async function uploadFilesToS3(
	s3,
	bucketName,
	objectKey,
	path
) {
	console.log('Uploading JSON to S3...');
	const params = {
		Bucket: bucketName,
		Key: objectKey,
		Body: fs.createReadStream(path), // Convert JSON to string
		ContentType: 'application/json', // Set content type
	};

	try {
		await s3.putObject(params).promise();
		console.log('JSON file uploaded successfully!');
	} catch (e) {
		console.error('Error during uploading JSON file: ', e);
	}
}

// Retrieve object from s3
async function getObjectFromS3(s3, bucketName, objectKey) {
	console.log('Getting Object from S3...');
	const param = {
		Bucket: bucketName,
		Key: objectKey,
	};

	try {
		const data = await s3.getObject(params).promise();
		console.log('Data from S3: ', data);
	} catch (e) {
		console.log('Error: ', e);
		return 'Error: ', e;
	}
}

// router
router.post('/getVideo', async function (req, res, next) {
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		sessionToken: process.env.AWS_SESSION_TOKEN,
		region: process.env.AWS_BUCKET_REGION,
	});

	// create s3
	const s3 = new AWS.S3();

	const bucketName = process.env.AWS_BUCKET_NAME;
	// TODO: fill in the video key name
	const objectKey = '';

	await createS3bucket(s3, bucketName);
	const rsp = await getObjectFromS3(
		s3,
		bucketName,
		objectKey
	);
	if (rsp === 'Error') {
		return res.status(500).json({ success: false });
	} else {
		return res.status(200).json({
			success: true,
			data: rsp,
		});
	}
});

// TODO: upload object to S3
router.post(
	'/updateVideo',
	async function (req, res, next) {
		const { video } = req.body;
		AWS.config.update({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			sessionToken: process.env.AWS_SESSION_TOKEN,
			region: process.env.AWS_BUCKET_REGION,
		});

		// Create an S3 client
		const s3 = new AWS.S3();

		// Specify the S3 bucket and object key
		const bucketName = process.env.AWS_BUCKET_NAME;
		// TODO: fill in the video key name
		const objectKey = '';

		// JSON data to be written to S3
		const data = {
			video: video,
		};
		await createS3bucket(s3, bucketName);
		await uploadJsonToS3(
			s3,
			bucketName,
			objectKey,
			jsonData
		);
	}
);

module.exports = router;
