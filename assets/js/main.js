/* jshint esversion: 6 */

let gameData;
let currentDay = 1;
let currentLocationId = 0;
let currentSequenceId = 0;
let currentLocation;
let currentSequence;
let currentScene;
function getGameInfo(callbackFunction) {
    $.getJSON("assets/js/story.json", (gameJson) => {
        gameData = gameJson;
        callbackFunction();
    });    
}

function startGame() {
    currentLocation = gameData.locations[currentLocationId];
    currentSequence = gameData.story.sequences[currentSequenceId];

    let options = [];
    let scene;
    
    if (currentScene === undefined) {
        let locationIds = currentLocation.connectedLocations;

        $.each(locationIds, (indexInArray, locationId) => { 
            options.push({
                "optionId": locationId,
                "optionText": gameData.locations[locationId].locationName
            });
        });

        scene = {
            "image": currentLocation.image,
            "text": `You are at the ${currentLocation.locationName}`
        };
    } else {
        let optionIds = currentSequence.scenes[currentScene].options;
        
        $.each(optionIds, (optionIndex, option) => {
            options.push({
                "optionId": option.nextScene,
                "optionText": option.optionText
            });
        });
    }
    buildOptions(options);
    buildScene(scene);
}

function buildOptions(options) {
    let optionQty = options.length;
    let controlsTemplate = ``;

    $.each(options, (optionIndex, option) => { 
        let buttonTemplate = `
            <div class="control-div col-lg-6 col-md-6 col-sm-12">
                <button class="btn control-button" value="${option.optionId}">
                    ${option.optionText}
                </button>
            </div>`;
        
        controlsTemplate += buttonTemplate;
    });

    $(".controls-container").html(controlsTemplate);
    $(".control-button").click(function() {
        processControl($(this).val());
    });
}

function buildScene(scene) {
    canvas = $("#game-canvas")[0];
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sceneImage = new Image();
    sceneImage.src = `assets/images/${scene.image}`;
    sceneImage.onload = () => ctx.drawImage(sceneImage, (canvas.width*0.2), 0, (canvas.width*0.6), (canvas.height*0.6));
    ctx.font = "30px Montserrat";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(scene.text, canvas.width/2, (canvas.height*0.9));
}

function processControl(controlVal) {
    if (currentScene === undefined) {
        currentLocationId = controlVal;
        startGame();
    }
}