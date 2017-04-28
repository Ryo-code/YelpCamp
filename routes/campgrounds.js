'use strict'
const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");

/* INDEX - show all campgrounds */
router.get("/", (req, res) => {
    console.log(req.user)
    //Get all campgrounds from DB, and THEN render that file
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"})
        }
    });
});

/* CREATE - add new campground to DB */
router.post("/", middleware.isLoggedIn, (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const price = req.body.price;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    const newCampground = {name: name, image: image, description: desc, price: price, author: author}; //gets from data, adds to campgrounds array
    //Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err){
            console.log("Oh no! " + err)
        } else {
            console.log("Just created this in the DB: " + newlyCreated)
            res.redirect("/campgrounds"); //redirect back to campgrounds page
        }
    });
});

/* NEW - Show form to create a new campground */
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

/* SHOW - Shows more info about one campground */
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
            //this renders the show template with that campground
        }
    });
});

/* EDIT - This shows the edit form */
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) =>{
        if(err){
            req.flash("error", "Campground not found") //Unlikely someone will ever see this, but you can handle errors like this anywhere
        }
        res.render("campgrounds/edit", {campground: foundCampground})
    });
});

/* UPDATE - This is where the form submits*/
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) =>{
    //find and update the correct campground
    //The arguments below: 1) what ID we're looking for, 2) the data that we wanna update, 3) callback
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err){
            res.redirect("/campgrounds");
        } else {
            //redirect somewhere(show page)
            res.redirect("/campgrounds/" + req.params.id)
        }
    }) 
})

/* DESTROY - Delete campground */
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) =>{
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            console.log("There was an error->", err)
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;