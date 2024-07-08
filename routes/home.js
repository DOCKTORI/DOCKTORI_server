const express = require('express');
const ensureAuthorization = require('../auth');
const { main, goal, favorites, readingBooks, finishedBooks, changeGoal, calender, nickname } = require('../controllers/home');

const router = express.Router();

router.use(express.json());
router.use(ensureAuthorization);

router.get('/main', main);
router.get('/goal', goal);
router.get('/favorites', favorites);
router.get('/readingBooks', readingBooks);
router.get('/finishedBooks', finishedBooks);
router.post('/changeGoal', changeGoal);
router.get('/calender', calender);
router.get('/nickname', nickname);

module.exports = router;