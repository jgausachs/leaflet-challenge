// Define earthquakes GeoJSON url
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create earthquakes layerGroup
var earthquakes = L.layerGroup();

// Create tile layer
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v11",
    accessToken: API_KEY
});

// Create map
var myMap = L.map("map", {
    center: [9.080, -79.680],
    zoom: 3,
    layers: [grayscaleMap, earthquakes]
});

d3.json(earthquakesURL, function (data) {

    // Define marker size by magnitude
    function markerSize(magnitude) {
        return magnitude * 4;
    };

    // Define marker color by depth
    function chooseColor(depth) {
        switch (true) {
            case depth > 300:
                return "lightpurple";
            case depth > 150:
                return "blue";
            case depth > 70:
                return "lightblue";
            case depth > 35:
                return "grey";
            default:
                return "lightgrey";
        }
    }

    // Create GeoJSON layer with features array
    // Popup with earthquake location and time information
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng,
                // Set the style of the markers based on properties.mag
                {
                    radius: markerSize(feature.properties.mag),
                    fillColor: chooseColor(feature.geometry.coordinates[2]),
                    fillOpacity: 0.7,
                    color: "black",
                    stroke: true,
                    weight: 0.5
                }
            );
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
                + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes);
    // Earthquakes layer added to myMap
    earthquakes.addTo(myMap);

    // Legend object
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            depth = [0, 35, 70, 150, 300],
            loop_length = depth.length;

        div.innerHTML += "<h3 style='text-align: center'>Quake depth (km)</h3>"
        for (var i = 0; i < loop_length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // Legend added to myMap
    legend.addTo(myMap);
});