const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

//renders the index page 
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

//renders the create new campground form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

//creates a campground
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully added a campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//renders the show campground page
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

//renders the edit campground form
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

//updates a campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const addImg = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...addImg); //need to spread, otherwise will push an array into an array
    await campground.save();
    if (req.body.deleteImages) {
        //pull from the images array all images which filename is in the deleteImages array
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ '$pull': { images: { filename: { '$in': req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//deletes a campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!')
    res.redirect('/campgrounds');
}