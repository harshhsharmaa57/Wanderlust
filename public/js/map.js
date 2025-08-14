

maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
container: 'map', // container's id or the HTML element to render the map
style: maptilersdk.MapStyle.STREETS,
center: [77.2150, 28.6500], // starting position [lng, lat]
zoom: 10.68, // starting zoom
});