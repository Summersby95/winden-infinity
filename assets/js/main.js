/* jshint esversion: 6 */

let gameData;
let currentDay = 1;
let currentLocationId = 0;
let currentSequenceId;
let currentSceneId;
let currentLocation;
let currentSequence;
let currentScene;
let completedSequences = [];

$(document).ready(function() {
    getGameInfo(startGame);
    $("#game-canvas").attr("width", $("#game-canvas").width());
    $("#game-canvas").attr("height", $("#game-canvas").height());
});


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
    
    if (currentSceneId === undefined) {
        let locationIds = currentLocation.connectedLocations;

        $.each(locationIds, (indexInArray, locationId) => { 
            options.push({
                "optionId": locationId,
                "optionText": gameData.locations[locationId].locationName
            });
        });

        options.push({
            "optionId": -1,
            "optionText": `Enter ${currentLocation.locationName}`
        });

        scene = {
            "image": currentLocation.image,
            "text": `You are at the ${currentLocation.locationName}`
        };
    } else {
        let optionIds = currentSequence.scenes[currentSceneId].options;
        
        $.each(optionIds, (optionIndex, option) => {
            options.push({
                "optionId": option.nextScene,
                "optionText": option.optionText
            });
        });

        scene = {
            "image": currentSequence.scenes[currentSceneId].sceneImage,
            "text": currentSequence.scenes[currentSceneId].text
        };
    }
    buildOptions(options);
    buildScene(scene);
}

function buildOptions(options) {
    let optionQty = options.length;
    let controlsTemplate = ``;

    $.each(options, (optionIndex, option) => { 
        let buttonTemplate = `
            <div class="control-div col">
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
    let canvas = $("#game-canvas")[0];
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = canvas.width*0.05;
    let y = canvas.height*0.05;
    let cardWidth = canvas.width*0.9;
    let cardHeight = canvas.height*0.9;

    // ctx.fillStyle = "white";
    // ctx.arc(x-10, y-10, 10, Math.PI*1.5, Math.PI, true);
    // ctx.arc(x-10, y+cardHeight-10, 10, Math.PI, Math.PI/2, true);
    // ctx.arc(x+cardWidth-10, y+cardHeight-10, 10, Math.PI/2, 0, true);
    // ctx.arc(x+cardWidth-10, y-10, 10, 0, 1.5*Math.PI, true);
    // ctx.fill();

    ctx.fillStyle = "black";
    ctx.arc(x, y, 10, Math.PI*1.5, Math.PI, true);
    ctx.arc(x, y+cardHeight, 10, Math.PI, Math.PI/2, true);
    ctx.arc(x+cardWidth, y+cardHeight, 10, Math.PI/2, 0, true);
    ctx.arc(x+cardWidth, y, 10, 0, 1.5*Math.PI, true);
    ctx.fill();

    

    sceneImage = new Image();
    sceneImage.src = `assets/images/${scene.image}`;
    sceneImage.onload = () => ctx.drawImage(sceneImage, (canvas.width*0.25), (canvas.height*0.05), (canvas.width*0.5), (canvas.height*0.9));
    ctx.font = "30px Montserrat";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    $("#scene-text").html(scene.text);
}

function processControl(controlVal) {
    if (currentSceneId === undefined) {
        if (controlVal == -1) {
            let sequenceSearch = $.grep(gameData.story.sequences, (sequence, seqIndex) => {
                return sequence.locationId == currentLocationId; 
            });

            currentSequence = sequenceSearch[0];
            currentSequenceId = currentSequence.sequenceId;

            if (sequenceSearch.length === 0 || completedSequences.includes(sequenceSearch[0].sequenceId)) {
                currentSceneId = currentSequence.scenes.length-1;
            } else {
                currentSceneId = 0;
            }
        } else {
            currentLocationId = parseInt(controlVal);
        }
    } else {
        if (controlVal == -1) {
            completedSequences.push(currentSequenceId);
            currentSceneId = undefined;
            currentSequenceId = undefined;
        } else {
            currentSceneId = controlVal;
        }
    }
    startGame();
}