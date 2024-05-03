if (process.env.NODE_ENV != "production") require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const MONGO_URL = process.env.ATLAS_DB_URL;
const methodOverride = require('method-override');
const path = require("path");
const engine = require("ejs-mate");
const port = 8080;
const app = express();
const ExpressError = require("./utils/ExpressError");
const listingRoutes = require("./routes/listingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/userSchema");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SECRET_KEY
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //7 Days in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //Use the localstrategy to authenticate the User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine("ejs", engine);

app.listen(port, () => {
    console.log(`Server is Listening to port ${port}`);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => console.log("Connected to MongoDB Successfully"))
    .catch((err) => console.error(err));



app.use((req, res, next) => {
    res.locals = {
        success: req.flash("success"),
        failure: req.flash("error"),
        currentUser: req.user
    }
    next();
});


app.get('/', (req, res) => {
    res.redirect("/listing");
});

app.use("/listing", listingRoutes);
app.use("/listing/:id/review", reviewRoutes);
app.use("/user", userRoutes);

app.all("*", (req, res, next) => {
   next(new ExpressError(404, "PAGE DOES NOT EXIST"));
});

app.use((err, req, res, next) => {
    let {status = 500, message = "something went wrong"} = err;
    res.status(status).send(message);
});