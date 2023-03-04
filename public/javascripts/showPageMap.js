// mapboxgl.accessToken = mapToken;
// const map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v11',
//     center: JSON.parse(campgroundCoord),
//     zoom: 8,

// });

// new mapboxgl.Marker()
//     .setLngLat([-74.5, 40])
//     .addTo(map)

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
