const express = require('express');
const ensureAuthorization = require('../auth');
const { join, login, logout, changePassword, cancelAccount } = require('../controllers/auth');

const router = express.Router();

router.use(express.json());

router.post('/join', join);
router.post('/login', login);
router.post('/logout', ensureAuthorization, logout);
router.post('/changePassword', changePassword);
router.delete('/cancelAccount', ensureAuthorization, cancelAccount);
module.exports = router;