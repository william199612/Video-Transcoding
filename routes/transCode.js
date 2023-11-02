const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegStatic);

// const uploadFile = (req, res, next) => {
//     const storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             cb(null, 'tmp/');
//         },
//         filename: (req, file, cb) => {
//             const extname = path.extname(file.originalname);
//             const filename = 'output' + extname;
//             cb(null, filename);
//         }
//     });
//     const upload = multer({ storage }).single('file');
//     upload(req, res, (err) => {
//         if (err) {
//             req.body.success = false;
//             req.body.errMsg = err;
//             console.log(err);
//         } else {
//             req.body.success = true;
//             req.body.file = req.file.filename;
//             next();
//         }
//     });
// };
// router.post('', uploadFile, (req, res) => {
//     if (req.body.success) {
//         return res.status(200).json({
//             success: true
//         });
//     } else {
//         return res.status(500).json({
//             success: false,
//             errMsg: req.body.errMsg
//         });
//     }
    
// });

const saveVideoToLocal = (req, res, next) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'tmp/');
        },
        filename: (req, file, cb) => {
            console.log('file:', file);
            // const extname = path.extname(file.originalname);
            const filename = file.originalname;
            cb(null, filename);
        }
    });
    if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp');
    }
    const upload = multer({ storage }).single('file');
    upload(req, res, (err) => {
        if (err) {
            console.log(`Upload Err: ${err}`);
            req.body.success = false;
            req.body.errMsg = err;
            console.log(err);
            next();
        } else {
            console.log(`Save file Successful!!`);
            transVideo(req, res, next);
        }
    });
};

const transVideo = (req, res, next) => {
    const { newFormat, originalFormat, resolution, fileName } = req.body;
    console.log('transVideo --->', newFormat);
    let outPutFileName = fileName;
    if (originalFormat === newFormat) outPutFileName += Date.now();

    ffmpeg(`./tmp/${fileName}.${originalFormat}`).size(`${resolution}x?`)
        .output(`./tmp/${outPutFileName}.${newFormat}`)
        .on('progress', function (progress) {
            console.log('Processing: ', progress.timemark);
        })
        .on('error', function (err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
            req.body.success = false;
            req.body.errMsg = err.message;
            next();
        })
        .on('end', function (stdout, stderr) {
            console.log('Transcoding Succedded!!!');
            req.body.fileName = outPutFileName + '.' + newFormat;
            req.body.success = true;
            next();
        })
        .run();
};

router.post('', saveVideoToLocal, (req, res) => {
    if (req.body.success) {
        return res.status(200).json({
            success: true,
            fileName: req.body.fileName
        });
    } else {
        return res.status(500).json({
            success: false,
            errMsg: req.body.errMsg
         });
    }
});

module.exports = router;
