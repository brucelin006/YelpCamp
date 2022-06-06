const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');

router.route('/register')
    .get(users.renderRegisterUser)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {
        failureRedirect: '/login',
        failureMessage: true,
        keepSessionInfo: true
    }), users.loginReturnTo)

router.get('/logout', isLoggedIn, users.logout)

module.exports = router;