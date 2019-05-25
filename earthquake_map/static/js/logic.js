function createFeatures (earthquakeData, tectonicData) {
	// Define a function to run for each feature in the earthquakeData array
	function onEachFeature (feature, layer) {
		layer.bindPopup("<h3>" + feature.properties.title +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
	}

	// Create a circle for each earthquake incidence, instead of the default marker
	function pointToLayer(feature, latlng) {
		const geojsonMarkerOptions = {
			radius: feature.properties.mag*4,
    		fillColor: quakeColor(feature.properties.mag),
    		color: "#000",
    		weight: 1,
    		opacity: 1,
    		fillOpacity: 0.8
		};

		return L.circleMarker(latlng, geojsonMarkerOptions);
	}

	// Create a GeoJSON layer containing the features array on the earthquakeData object
	// Run the onEachFeature function once for each datum in the array
	const earthquakes = L.geoJSON(earthquakeData, {
		onEachFeature: onEachFeature,
		pointToLayer: pointToLayer
	});

	// Create a GeoJSON layer containing the tectonic plate boundaries
	const plateBoundaries = L.geoJSON(tectonicData);

	// Send earthquakes layer to the createMap function
	createMap(earthquakes, plateBoundaries);
}





// Give color scale for earthquakes based on magnitude
// Scale is colorblind friendly
// Source for color scale: http://colorbrewer2.org/#type=diverging&scheme=BrBG&n=6
function quakeColor (mag) {
	if (mag <= 1) {
		return "#01665e";
	} else if (mag <= 2) {
		return "#5ab4ac";
	} else if (mag <= 3) {
		return "#c7eae5";
	} else if (mag <= 4) {
		return "#f6e8c3";
	} else if (mag <= 5) {
		return "#d8b365";
	} else {
		return "#8c510a";
	}
}





function createMap (earthquakes, plateBoundaries) {
	// Define Mapbox Light layer
	const lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.light",
		accessToken: API_KEY
	});

	// Define Mapbox Satellite Layer
	const satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.satellite",
		accessToken: API_KEY
	});

	// Define Mapbox Outdoors Layer
	const outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.outdoors",
		accessToken: API_KEY
	});


	// Define a baseMaps object to hold our base layers
	const baseMaps = {
		"Satellite": satelliteMap,
		"Grayscale": lightMap,
		"Outdoors": outdoorsMap
	};

	// Create overlay object to hold our overlay layer
	const overlayMaps = {
		"Fault Lines": plateBoundaries,
		"Earthquakes": earthquakes
	};

	// Create the map
	const myMap = L.map("map", {
		center: [0,-70],
		zoom: 4,
		layers: [satelliteMap, earthquakes, plateBoundaries],
		worldCopyJump: true
	});

	L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);


    // Create legend and add to map
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    	let div = L.DomUtil.create('div', 'info legend'),
    		grades = [0, 1, 2, 3, 4, 5],
    		labels = [];

		grades.forEach((g, i, a) => {
			div.innerHTML += '<i style="background:' + quakeColor(g+1) + '"></i>' + g;
			if (a[i+1]) {
				div.innerHTML += '&ndash;' + a[i+1] + '<br/>';
			} else {
				div.innerHTML += '+';
			}
		});
		console.log(div);
		return div;
    };

    legend.addTo(myMap);
}





(async function() {
	// Get GeoJSON data on earthquakes from the past 24 hours from USGS
	const data = await d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");

	// Load GeoJSON data on tectonic plate boundaries
	// Thanks to Hugo Ahlenius, Nordpil, and Peter Bird for the source data
	//  https://github.com/fraxen/tectonicplates
	const tectonicData = await d3.json("static/json/PB2002_steps.json");
	console.log(tectonicData);

	// Send the features of our GeoJSON data to a function to create the map features
	createFeatures(data.features, tectonicData.features);
})()
