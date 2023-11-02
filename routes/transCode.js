const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

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
    console.log('====>', req.body);
    // const { newFormat, originalFormat, resolution } = req.body;
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'tmp/');
        },
        filename: (req, file, cb) => {
            const extname = path.extname(file.originalname);
            const filename = 'input' + extname;
            cb(null, filename);
        }
    });
    const upload = multer({ storage }).single('file');
    upload(req, res, (err) => {
        if (err) {
            console.log(`Upload Err: ${err}`);
            req.body.success = false;
            req.body.errMsg = err;
            console.log(err);
            next();
        } else {
            console.log(`Upload Successful!!`);
            req.body.success = true;
            // req.body.newFormat = newFormat;
            // req.body.originalFormat = originalFormat;
            // req.body.resolution = resolution;
            transVideo(req, res, next);
        }
    });
};

const transVideo = (req, res, next) => {
    const { newFormat, originalFormat, resolution } = req.body;
    console.log('--->', req.body);
    ffmpeg(`./tmp/input.${originalFormat}`)
        .output(`output.${newFormat}`)
        .on('progress', function (progress) {
            console.log('Processing: ', progress.timemark);
        })
        .on('error', function (err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
        })
        .on('end', function (stdout, stderr) {
            console.log('Transcoding Succedded!!!');
        })
        .run();
    next();
};


router.post('', saveVideoToLocal, (req, res) => {
    if (req.body.success) {
        return res.status(200).json({
            success: true
        });
    } else {
        return res.status(500).json({
            success: false
         });
    }
});

module.exports = router;
