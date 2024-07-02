const express = require('express');
const ensureAuthorization = require('../auth');
const { join, login, logout, password, cancelAccount } = require('../controllers/auth');

const router = express.Router();

router.use(express.json());

router.post('/join', join);
router.post('/login', login);
router.post('/logout', ensureAuthorization, logout);
router.patch('/password',ensureAuthorization, password);
router.delete('/cancelAccount', ensureAuthorization, cancelAccount);
module.exports = router;