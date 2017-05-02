var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET Shot page. */
router.get('/shot', function(req, res, next) {
  res.render('shot');
});

module.exports = router;
