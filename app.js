'use strict';

const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const mongoose      = require("mongoose");
const passport      = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const flash         = require("connect-flash");
const Campground    = require("./models/campground");
const Comment       = require("./models/comment");
const User          = require("./models/user");
const seedDB        = require("./seeds");

//Requiring Routes
const commentRoutes     = require("./routes/comments");
const campgroundRoutes  = require("./routes/campgrounds");
const indexRoutes       = require("./routes/index") //Could also have been called "authRoutes" ;)

console.log("Here's what the DATABASEURL environmental variable is:", process.env.DATABASEURL)
const url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp" //Someone who clones this project will be able to create their own local DB with this code, because the enviro variable won't work for them
mongoose.connect(url); //This is much more secure than having your DB name & password entered in your code (especially if it's open-source!)

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //we did 「express.static("public")」 before, but "__dirname" just refers to the directory name of the current module which is safer in case you change around your files or whatever (feel free to console log __dirname for proof)
app.use(methodOverride("_method"));
app.use(flash()); //Must be before the passport configuration
// seedDB(); //Seed the DB

app.locals.moment = require("moment"); //moment.js now available in all your view files via the variable name "moment"

//*****PASSPORT CONFIGURATION*****
app.use(require("express-session")({
    secret: "Web development is cool!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()) ); //this gives us the ".authenticate" method in the login post route
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{           //This will run for every single route.
    res.locals.currentUser = req.user; //Whatever we put in "res.locals" is what's available inside of the user's current template
    res.locals.error = req.flash("error"); //Since you use "message" in your header partial, this makes it able to access message on all the pages with that header
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes); //All the campgrounds routes start this way, so in routes/campgrounds.js, you don't need to write that anymore (just what comes after that)
app.use("/campgrounds/:id/comments", commentRoutes); //Same thing for comments... this just keeps the code DRY

app.listen(process.env.PORT || 3000, () => {
  console.log('The YelpCamp Server has started (on port 3000)!')
})
