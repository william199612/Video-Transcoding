const express = require('express');
const router = express.Router();

router.post('', function (req, res) {
    const { file } = req.body;
    console.log(file);
    return res.status(200).json({
        success: true,
        msg: 'HIHI'
    });
});

module.exports = router;
