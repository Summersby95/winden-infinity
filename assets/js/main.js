/* jshint esversion: 6 */

let gameData;
let currentLocationId = 0;
let currentSequenceId = 0;
let currentSceneId = 0;
let currentLocation;
let currentSequence;
let currentScene;
let endingId;
let completedSequences = [];
let bunkerHandleSeq = [];
let bunkerSuccessSeq = ['l', 'l', 'r'];



$(document).ready(function() {
    getGameInfo(startGame);

    $("#submitFeedback").click(function() {
        validateForm();
    });
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

    if (endingId !== undefined) {
        options.push({
            "optionId": 0,
            "optionText": "End Game"
        }, {
            "optionId": "restart",
            "optionText": "Restart Game"
        });

        scene = {
            "image": gameData.story.endings[endingId].endImage,
            "text": gameData.story.endings[endingId].endText
        };
    } else if (currentSceneId === undefined) {
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
    
    if (endingId === undefined) {
        $(".control-button").click(function() {
            processControl($(this).val());
        });
    } else {
        $(".control-button").click(function() {
            processEnding($(this).val());
        });
    }
}

function buildScene(scene) {
    $("#game-canvas").attr("src", `assets/images/${scene.image}`);
    $("#scene-text").html(scene.text);
}

function processControl(controlVal) {
    if (controlVal.includes("end")) {
        endingId = controlVal.split("_")[1];
    } else if (currentSceneId === undefined) {
        if (controlVal == -1) {
            let sequenceSearch = $.grep(gameData.story.sequences, (sequence, seqIndex) => {
                return sequence.locationId == currentLocationId;
            });

            currentSequence = sequenceSearch[0];
            currentSequenceId = currentSequence.sequenceId;

            if (
                sequenceSearch.length === 0 || 
                completedSequences.includes(sequenceSearch[0].sequenceId) ||
                    (
                    currentSequenceId == 11 && 
                    !completedSequences.includes(8)
                    )
                ) {
                currentSceneId = currentSequence.scenes.length-1;
            } else {
                currentSceneId = 0;
            }
        } else {
            currentLocationId = parseInt(controlVal);
        }
    } else {
        if (currentSequenceId == 9 && currentSceneId == 2) {
            bunkerHandleSeq.push(controlVal);
            if (arrayCheck(bunkerSuccessSeq, bunkerHandleSeq)) {
                currentSceneId = 3;
            }
        } else if (controlVal == -1) {
            if (currentSequenceId != 11) {
                completedSequences.push(currentSequenceId);
            }
            currentSceneId = undefined;
            currentSequenceId = undefined;
        } else {
            currentSceneId = controlVal;
        }
    }
    startGame();
}

function arrayCheck(a, b) {
    return a.length === b.length && 
        a.every((val, index) => val === b[index]);
}

function validateForm() {
    sendEmail();
}

function sendEmail() {
    emailjs.send("service_hs5tljx","template_o9nml2i", {
        from_name: $("#emailAddress").val(),
        message_text: $("#fromName").val(),
        from_email: $("#messageText").html()
    })
        .then(function() {
            console.log('Success!');
        }, function(error) {
            console.log('Failed...', error);
        });
}