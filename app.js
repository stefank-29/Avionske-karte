const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
const adminRouter = require('./routes/admin.router.js');


 require('./handlers/passport')
//  (passport);


// create our Express app
const app = express();

//! ovo se renderuje
// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

//! globalni middleware-ovi (za svaki request)
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

//? za slanje kad potvrdim formu (name postaje atribut od req.body)
// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(
    session({
        secret: process.env.SECRET,
        key: process.env.KEY,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

//? Passport JS is what we use to handle our logins
// app.use(passport.initialize());
// app.use(passport.session());

// The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

//? varijable se prosledjuju templejtu u svim request-ovima
// pass variables to our templates + all r equests
app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash(); // pokrece flesh u sledecem reqestu (cuva sve requestove)
    res.locals.user = req.user || null; //! salje usera ako je ulogovan inace salje null
    res.locals.currentPath = req.path;
    next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
    req.login = promisify(req.login, req);
    next();
});

// After allllll that above middleware, we finally handle our own routes!
app.use('/',routes); //! svaki put kad se unese url sa '/' pokrene se routes (a u index.js se za svaki pojedinacno odredi sta koji radi)
app.use('/admin',adminRouter);
//! ako routes gore ne rade (posalju next)
// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
    /* Development Error Handler - Prints stack trace */
    app.use(errorHandlers.developmentErrors); //? dev greska
}

// production error handler
app.use(errorHandlers.productionErrors); //? prod greska (za usera, bez stacktrace-a)

// done! we export it so we can start the site in start.js
module.exports = app;
