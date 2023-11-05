const AWS = require('aws-sdk');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// create s3 bucket
async function createS3bucket (s3, bucketName) {
	console.log('Creating Bucket...');
	try {
		await s3
			.createBucket({ Bucket: bucketName })
			.promise();
		console.log(`Created bucket: ${bucketName}`);
		return { successCreateBucket: true };
	} catch (e) {
		if (e.statusCode === 409) {
			console.log(`${bucketName} already exist!`);
			return { successCreateBucket: true };
		} else {
			console.log(`Error during creating bucket: ${e}`);
			return { successCreateBucket: false, err: `Error during creating bucket:\n ${e.code}: ${e.message}` };
		}
	}
}

// upload json data to s3
async function uploadJsonToS3 (s3, bucketName, objectKey) {
	console.log('UploadJsonToS3:', objectKey);
	const params = {
	  Bucket: bucketName,
	  Key: objectKey,
	  Body: fs.createReadStream(`./tmp/${objectKey}`)
	};
	try {
	  await s3.putObject(params).promise();
	  fs.readdir('./tmp', function (err, files) {
		if (err) {
			console.log('Unable to scan directory: ' + err);
		} 

		files.forEach(function (file) {
			console.log(file);
			fs.unlinkSync(`./tmp/${file}`);
		});
	});
	  console.log('File uploaded successfully.');
	  return { successUpload: true };
	} catch (err) {
	  console.error('Error uploading file:', err);
	  return { successUpload: false, errMsg: err };
	}
}


router.post('', async function (req, res, next) {
    const { fileName } = req.body;
	console.log(fileName);
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
        region: process.env.AWS_BUCKET_REGION
    });
      
    // Create an S3 client
    const s3 = new AWS.S3();
      
    // Specify the S3 bucket and object key
    const bucketName = process.env.AWS_BUCKET_NAME;
    const objectKey = fileName;
      
    const { successCreateBucket, err = '' } = await createS3bucket(s3, bucketName);
	if (successCreateBucket) {
		console.log('76');
		const { successUpload, errMsg = '' } = await uploadJsonToS3(s3, bucketName, objectKey);
		if (successUpload) {
			return res.status(200).json({
				success: true,
				url: `https://${bucketName}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${objectKey}`
			});
		} else {
			return res.status(200).json({
				success: false,
				errMsg: errMsg
			});
		}
	} else {
		console.log('90');
		return res.status(200).json({
			success: false,
			errMsg: err
		});
	}
   
});

module.exports = router;
