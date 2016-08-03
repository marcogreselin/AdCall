/**
 * Created by marco on 03/08/2016.
 */


var express = require('express');
var router = express.Router();
var queries = require('../db/queries');


router.get('/serveBanner', queries.serveBanner);

module.exports = router;