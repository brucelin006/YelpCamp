const mongoose = require('mongoose');
const Campground = require('../models/campground'); //need to back out one level
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < cities.length; i++) {
        const randNum = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 20) + 10;
        const newCamp = new Campground({
            author: '6295068c16c8d294be8270b1',
            location: `${cities[randNum].city}, ${cities[randNum].province_name}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[randNum].lng, cities[randNum].lat]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/lingcloud/image/upload/v1654117038/YelpCamp/jlmof32hakrmqfhh0lm0.jpg',
                    filename: 'YelpCamp/jlmof32hakrmqfhh0lm0',
                },
                {
                    url: 'https://res.cloudinary.com/lingcloud/image/upload/v1654117040/YelpCamp/etqbdjpxcjt9cd0uwef1.jpg',
                    filename: 'YelpCamp/etqbdjpxcjt9cd0uwef1',
                },
                {
                    url: 'https://res.cloudinary.com/lingcloud/image/upload/v1654118487/YelpCamp/xlvqqtzfgvp8wqzpzm1u.jpg',
                    filename: 'YelpCamp/xlvqqtzfgvp8wqzpzm1u',
                },
                {
                    url: 'https://res.cloudinary.com/lingcloud/image/upload/v1654118487/YelpCamp/r5lnrj7xheszr7xbmoph.jpg',
                    filename: 'YelpCamp/r5lnrj7xheszr7xbmoph',
                }
            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis perferendis distinctio inventore consectetur rerum nemo eos, magnam, deleniti neque voluptatem ullam veniam eveniet quos nisi sit dignissimos quo. Possimus, sit.',
            price
        });
        await newCamp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});