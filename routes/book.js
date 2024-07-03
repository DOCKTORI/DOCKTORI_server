const express = require('express');
const ensureAuthorization = require('../auth');
const { 
    addDeletelike, 
    searchBooks,
    selectBook,
    finishReading,
    bookDetail, 
    changeDate, 
    remind, 
    deleteRemind, 
    review,
    deleteBook
} = require('../controllers/book');


const router = express.Router();
router.use(express.json());
router.use(ensureAuthorization);

router.post('/like', addDeletelike);
router.get('/search', searchBooks);
router.put('/select', selectBook);
router.post('/finishReading', finishReading); 
router.get('/detail', bookDetail);
router.post('/changeDate', changeDate);
router.put('/remind', remind);
router.delete('/deleteRemind', deleteRemind);
router.post('/review', review);
router.delete('/deleteBook', deleteBook);

module.exports = router;