var earthR = 6378100;
var guessR = 35;
var directions = [];
var latitudes = [];
var longitudes = [];
var routeIndex = 0;
var currentlat = 0;
var currentlng = 0;
var currenthdg = 0;
var currentptc = 0;
var bootup = 1;
var totalscore = 0.0;
var partscore = 0.0;
var time = 0;
var timer;

function initialize() {
    const default_fenway = { lat: 42.345573, lng: -71.098326 };
    const location = bootup ? default_fenway : { lat: this.latitudes[this.routeIndex], lng: this.longitudes[this.routeIndex] };
    if (bootup) {
        this.currentlat = 42.345573;
        this.currentlng = -71.098326;
        this.currenthdg = 0;
        this.currentptc = 0;
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
                heading: this.currenthdg,
                pitch: this.currentptc,
            },
        },
    );

    //triggers everytime position changed
    panorama.addListener("position_changed", () => {
        this.currentlat = panorama.getPosition().lat();
        this.currentlng = panorama.getPosition().lng();
        this.currenthdg = panorama.getPov().heading;
        this.currentptc = panorama.getPov().pitch;

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
            this.totalscore += this.partscore;
            this.partscore = 5000.0 / (this.directions.length-1);
            if (this.directions[this.routeIndex] == "DONE") {
                document.getElementById("output").innerHTML = "You Scored " + Math.round(this.totalscore) + "pts in " + this.time + " seconds! Congrats!";
                document.getElementById("timer").hidden = true;
                document.getElementById("load").hidden = false;
                document.getElementById("inputs").hidden = false;
                document.getElementById("toggleMap").hidden = false;
                document.getElementById("loadCheckpoint").hidden = true;
                document.getElementById("outputs").style.cssFloat = "left";
                clearTimeout(this.timer);
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
    try {
        const data = document.getElementById("exercise").value.split("~");
        for (let i = 0; i < data.length; i += 3) {
            if (!parseFloat(data[i]) || !parseFloat(data[i + 1]))
                throw Exception();
            this.latitudes.push(parseFloat(data[i]));
            this.longitudes.push(parseFloat(data[i + 1]));
            this.directions.push(data[i + 2]);
        }
    }
    catch {
        document.getElementById("exercise").value = "Bad instruction set; please try again";
        this.latitudes = [];
        this.longitudes = [];
        this.directions = [];
        this.bootup = 1;
        initialize();
        return;
    }

    //display current position and direction
    this.routeIndex = 0;
    this.initialize();
    document.getElementById("output").innerHTML = this.directions[this.routeIndex];

    document.getElementById("timer").hidden = false;
    document.getElementById("exercise").value = "";
    document.getElementById("load").hidden = true;
    document.getElementById("inputs").hidden = true;
    document.getElementById("loadCheckpoint").hidden = false;
    document.getElementById("outputs").style.cssFloat = "right";

    this.time = 0;
    this.score = 0.0;
    this.partscore = 5000.0 / this.directions.length;
    this.timer = window.setInterval(update, 1000);
}

//loads most recent checkpoint
function loadCheckpoint() {
    this.initialize();
    this.partscore *= .66667;
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

//updates everysecond
function update() {
    this.time += 1;
    this.partscore *= .995;
    document.getElementById("timeDisplay").innerHTML = "Current Time:<br>" + this.time +
        " seconds<br>Current Points Available:<br>" + Math.round(this.partscore) +
        "<br>Total Points Scored:<br>" + Math.round(this.totalscore);
}



window.initialize = initialize;