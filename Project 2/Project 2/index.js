var directions = [];
var positions = [];
var routeIndex = 0;
var bootup = 1;

function initialize() {
    const fenway = { lat: 42.345573, lng: -71.098326 };
    const location = bootup ? fenway : this.positions[routeIndex];


    const map = new google.maps.Map(document.getElementById("map"), {
        center: fenway,
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
        pos = panorama.getPosition();
        //check if close enough to next position to trigger next direction
    });

    map.setStreetView(panorama);
    bootup = 0;
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
    const pos = { lat: 42.345573, lng: -71.098326 };
    this.positions.push(pos);
    directions.push(document.getElementById("exercise").value);

    //display current position and direction
    routeIndex = 0;
    this.initialize();
    document.getElementById("output").innerHTML += directions[routeIndex];

    document.getElementById("exercise").value = "";
}

//adds position and direction pair to output; "DONE" if final position
function addDirection() {
    document.getElementById("output").innerHTML += "<br>" + document.getElementById("direction").value;
    document.getElementById("direction").value = "";
}

function saveExercise() {

}



window.initialize = initialize;