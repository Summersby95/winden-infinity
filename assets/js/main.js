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
            <div class="control-div col d-none d-sm-flex">
                <button class="btn control-button" value="${option.optionId}">
                    ${option.optionText}
                </button>
            </div>
            <div class="control-div col-12 d-flex d-sm-none">
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
    $("#game-canvas").attr("src", `assets/images/${scene.image}`);
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