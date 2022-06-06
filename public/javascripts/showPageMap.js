mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position coordinates: [lng, lat]
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Create a new marker.
const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25}) //Offset is just the distance of the popup box from the marker (unclustered point).
            .setHTML(
                `<h5>${campground.title}</h5><p>${campground.location}</p>`
            )
    )
    .addTo(map);