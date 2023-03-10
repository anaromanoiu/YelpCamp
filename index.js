if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


//mongodb+srv://anamariaromanoiu24:<password>@cluster0.joooqao.mongodb.net/?retryWrites=true&w=majority
//P0QPiLbM4WNFufp9

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');


const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');



const MongoDBStore = require('connect-mongo')(session);

//const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';    

//'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database connected");
})

const app = express();



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

const store = new MongoDBStore({
    url: 'mongodb://127.0.0.1:27017/yelp-camp',
    secret:'thisshouldbeabettersecret',
    touchAfter:24 * 60 * 60,
});

store.on('error', function(e){
    console.log("session store error", e);
})

const sessionConfig = {
    store,
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);




app.get('/', (req, res) => {
    res.render('home');
});





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})






app.listen(3000, () => {
    console.log('Serving on port 3000');
})