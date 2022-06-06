const User = require('../models/user');

//renders the register user page
module.exports.renderRegisterUser = (req, res) => {
    res.render('users/register');
}

//registers a new user
module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

//renders the login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

//redirects to the login page if not logged in
module.exports.loginReturnTo = (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(req.session.returnTo || '/campgrounds');
}

//logs out the current user
module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Successfully logged out, goodbye!');
        res.redirect('/campgrounds');
    })
}