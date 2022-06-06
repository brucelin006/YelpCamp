if (process.env.NODE_ENV !== 'production') {
    //if in development mode, require the package and add it into process.env for accessiblility for other files
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();
// const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600, //seconds
})

store.on("error", e => {
    console.log("Session store error", e);
})

const sessionConfig = {
    store,
    name: 'session', //will replace the default name connect.sid
    secret,
    resave: false, //don't save session if unmodified
    saveUninitialized: true, 
    cookie: {
        httpOnly: true, //not accessible through js
        // secure: true, //cookies can only be configured with https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 //milliseconds
    }
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/"

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/lingcloud/"
];
const fontSrcUrls = [];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/lingcloud/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
        ],
        mediaSrc: ["https://res.cloudinary.com/lingcloud/"],
        fontSrc: ["'self'", ...fontSrcUrls],
    }}
));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Something went wrong ';
    const statusCode = err.statusCode || 500;
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
});