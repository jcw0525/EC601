var earthR = 6378100;
var guessR = 35;
var directions = [];
var latitudes = [];
var longitudes = [];
var routeIndex = 0;
var currentlat = 0;
var currentlng = 0;
var bootup = 1;

function initialize() {
    const default_fenway = { lat: 42.345573, lng: -71.098326 };
    const location = bootup ? default_fenway : { lat: this.latitudes[this.routeIndex], lng: this.longitudes[this.routeIndex] };
    if (bootup) {
        this.currentlat = 42.345573;
        this.currentlng = -71.098326;
        document.getElementById("loadCheckpoint").hidden = true;
        bootup = 0;
    }

    const map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 14,
    });
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
            position: location,
            pov: {
                heading: 34,
                pitch: 10,
            },
        },
    );

    //triggers everytime position changed
    panorama.addListener("position_changed", () => {
        this.currentlat = panorama.getPosition().lat();
        this.currentlng = panorama.getPosition().lng();

        //check if close enough to next position to trigger next direction
        //implement haversine formula
        const phi1 = this.currentlat * Math.PI / 180.0;
        const phi2 = this.latitudes[this.routeIndex + 1] * Math.PI / 180.0;
        const lmd1 = this.currentlng * Math.PI / 180.0;
        const lmd2 = this.longitudes[this.routeIndex + 1] * Math.PI / 180.0;

        const latSin = Math.pow(Math.sin((phi2 - phi1) / 2), 2);
        const lngSin = Math.pow(Math.sin((lmd2 - lmd1) / 2), 2);
        const theta = Math.pow(latSin + Math.cos(phi1) * Math.cos(phi2) * lngSin, .5);
        const distance = 2 * this.earthR * Math.asin(theta);

        if (distance <= guessR) {
            this.routeIndex++;
            this.initialize();
            document.getElementById("output").innerHTML = this.directions[this.routeIndex];
            if (this.directions[this.routeIndex] == "DONE") {
                document.getElementById("output").innerHTML = "You Scored XXX pts in XXX seconds! Congrats!";
                document.getElementById("load").hidden = false;
                document.getElementById("inputs").hidden = false;
                document.getElementById("toggleMap").hidden = false;
                document.getElementById("loadCheckpoint").hidden = true;
            }
        }
    });

    map.setStreetView(panorama);
}

//toggles map for easier exercise creation
function toggleMap() {
    document.getElementById("map").hidden = !document.getElementById("map").hidden;
}

//loads exercise into memory by contnets of exercise text box
function loadExercise() {
    document.getElementById("toggleMap").hidden = true;
    document.getElementById("map").hidden = true;

    //load positions and directions
    const data = document.getElementById("exercise").value.split("~");
    for (let i = 0; i < data.length; i += 3)
    {
        this.latitudes.push(parseFloat(data[i]));
        this.longitudes.push(parseFloat(data[i + 1]));
        this.directions.push(data[i + 2]);
    }

    //display current position and direction
    this.routeIndex = 0;
    this.initialize();
    document.getElementById("output").innerHTML = this.directions[this.routeIndex];

    document.getElementById("exercise").value = "";
    document.getElementById("load").hidden = true;
    document.getElementById("inputs").hidden = true;
    document.getElementById("loadCheckpoint").hidden = false;
}

//loads most recent checkpoint
function loadCheckpoint() {
    this.initialize();
}

//adds position and direction pair to output; "DONE" if final position
function addDirection() {
    document.getElementById("output").innerHTML += "<br>" + this.currentlat + "~" + this.currentlng + "~" + document.getElementById("direction").value + "~";
    document.getElementById("direction").value = "";
}

//adds eof to instruction set
function saveExercise() {
    document.getElementById("output").innerHTML += "<br>" + this.currentlat + "~" + this.currentlng + "~DONE";
}



window.initialize = initialize;