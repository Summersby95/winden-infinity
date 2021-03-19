/* jshint esversion: 6 */

// Game Variables that are used to change scene/location etc
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


// when everything is loaded we trigger the ajax function to call the json story file, we use the startGame function as the callback
$(document).ready(function() {
    getGameInfo(startGame);

    // we add a click handler to the submitFeedback button
    $("#submitFeedback").click(function() {
        validateForm();
    });
});

// this function uses the getJSON api to fetch the game data and pass it to a callback function
function getGameInfo(callbackFunction) {
    $.getJSON("assets/js/story.json", (gameJson) => {
        gameData = gameJson;
        callbackFunction();
    });    
}

// the start game function sets the scene variables depending on the state of the game variables when it is triggered.
function startGame() {
    currentLocation = gameData.locations[currentLocationId];
    currentSequence = gameData.story.sequences[currentSequenceId];

    // we create an options array to store the options to be passed to the buildOptions function
    let options = [];
    // we create a scene variable to hold the scene object to be passed to the buildScene function
    let scene;

    // if the ending is not undefined then we are at an ending and we only want to show two options
    // one to end the game and one to restart the game
    if (endingId !== undefined) {
        options.push({
            "optionId": 0,
            "optionText": "End Game"
        }, {
            "optionId": "restart",
            "optionText": "Restart Game"
        });

        // we build the ending scene based on the ending objects in the story file
        scene = {
            "image": gameData.story.endings[endingId].endImage,
            "text": gameData.story.endings[endingId].endText
        };
        // if the ending is undefined and the currentSceneId is undefined then we are at a location
        // from the locations we want to be able to navigate to it's connected locations so 
        // we build the options from the connectedlocations array in the loction object from the data file
    } else if (currentSceneId === undefined) {
        let locationIds = currentLocation.connectedLocations;

        $.each(locationIds, (indexInArray, locationId) => { 
            options.push({
                "optionId": locationId,
                "optionText": `Go to ${gameData.locations[locationId].locationName}`
            });
        });

        // we also create an option to enter the current location which will trigger the sequence at that location
        options.push({
            "optionId": -1,
            "optionText": `Enter ${currentLocation.locationName}`
        });

        // the scene is built off the location object
        scene = {
            "image": currentLocation.image,
            "text": `You are at the ${currentLocation.locationName}`
        };
    } else {
        // if the currentSceneId is not undefined then we are in a sequence
        // we then build the options from the scene's options array
        let optionIds = currentSequence.scenes[currentSceneId].options;
        
        $.each(optionIds, (optionIndex, option) => {
            options.push({
                "optionId": option.nextScene,
                "optionText": option.optionText
            });
        });

        // the scene image and text are defined in the scene object
        scene = {
            "image": currentSequence.scenes[currentSceneId].sceneImage,
            "text": currentSequence.scenes[currentSceneId].text
        };
    }
    // once we have set our scene and options we pass them to the buildOptions and buildScene functions
    buildOptions(options);
    buildScene(scene);
}

// The buildOptions functions builds the button controls based off the options array that it is passed
function buildOptions(options) {
    let optionQty = options.length;
    let controlsTemplate = ``;

    // we create an empty template literal and add two divs for each option, each containing a button 
    // we create two divs so that on mobile the buttons flow underneath each other, but wrap beside each 
    // other on larger screen sizes
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

    
    // when the controlsTemplate is complete we put it into the controls container
    $(".controls-container").html(controlsTemplate);
    
    // if the ending is undefined then we are not at an ending and we want the processControl 
    // function to handle the click event
    if (endingId === undefined) {
        $(".control-button").click(function() {
            processControl($(this).val());
        });
        // if we are at an ending then we want the processEnding function to handle the event
    } else {
        $(".control-button").click(function() {
            processEnding($(this).val());
        });
    }
}

// the buildScene function changes the image source of the game canvas and the scene text
function buildScene(scene) {
    $("#game-canvas").attr("src", `assets/images/${scene.image}`);
    $("#scene-text").html(scene.text);
}

// the processEnding function will reload the page to restart the game if the controlVal is "restart"
// otherwise it will toggle the about modal to give players more info about the game
function processEnding(controlVal) {
    if (controlVal == "restart") {
        window.location.reload();
    } else {
        $("#aboutModal").modal('show');
    }
}

// the processControl function handles the click event for non-ending scenes
function processControl(controlVal) {
    // if the controlval includes the string "end" it is triggering an ending
    if (controlVal.includes("end")) {
        // we split the string and pass the integer to the endingId, the startGame function will handle the rest
        endingId = controlVal.split("_")[1];
        // if the currentSceneId is undefined then we are at a location and we handle the controlVal accordingly
    } else if (currentSceneId === undefined) {
        // if the controlVal is -1 then the player is entering the location
        if (controlVal == -1) {
            // we need to first find the sequence for this location so we search the sequences for a locationId that matches the currentLocationId
            let sequenceSearch = $.grep(gameData.story.sequences, (sequence, seqIndex) => {
                return sequence.locationId == currentLocationId;
            });

            // we then set the currentSequence and currentSequenceId based on the search
            currentSequence = sequenceSearch[0];
            currentSequenceId = currentSequence.sequenceId;

            // if the sequenceSearch yielded no results or the sequence has already been completed 
            // we set the sceneId to the last sceneId of the currentSequence which will inform the player 
            // that the sequence is done
            if (
                sequenceSearch.length === 0 || 
                completedSequences.includes(sequenceSearch[0].sequenceId) ||
                // we also check to see if this is the cave sequence and if it is we want them to have
                // completed the school sequence first
                    (
                    currentSequenceId == 11 && 
                    !completedSequences.includes(8)
                    )
                ) {
                currentSceneId = currentSequence.scenes.length-1;
            } else {
                // if the sequence has not been completed or is not the cave sequence without having
                // the school sequence done, then we set the sceneId to 0, the first scene in the sequence
                currentSceneId = 0;
            }
        } else {
            // if the controlVal is not -1 then we are transitiong to a new location which we pass to the currentLocationId variable
            currentLocationId = parseInt(controlVal);
        }
    } else {
        // if the currentSceneId is not undefined then we are in a sequence
        // we first check if we are in the bunker sequence attempting to open the door
        // if we are we want to check if the player has entered the correct combination
        // if they have then we manually increment the scene for them
        if (currentSequenceId == 9 && currentSceneId == 2 && controlVal != '10') {
            bunkerHandleSeq.push(controlVal);
            if (arrayCheck(bunkerSuccessSeq, bunkerHandleSeq)) {
                currentSceneId = 3;
            }
            // if the controlVal is -1 then the player has finished a sequence and we need to transition
            // them out of it.
        } else if (controlVal == -1) {
            // we want to mark the sequence as complete so we push the sequenceId to the completedSequences array
            // we dont do this if it is the cave sequence because we could lock the player out of the sequence before
            if (currentSequenceId != 11) {
                completedSequences.push(currentSequenceId);
            }
            // we also set the currentSceneId and currentSequenceId to undefined so that the startGame function 
            // knows that we are not in a scene anymore
            currentSceneId = undefined;
            currentSequenceId = undefined;
        } else {
            // if the controlVal is not -1 then we simply want to set the currentSceneId to the controlVal
            currentSceneId = controlVal;
        }
    }
    // we then run the startGame function again to process the changes we've made and change the scene
    startGame();
}

// this function checks if two arrays are exactly the same
function arrayCheck(a, b) {
    return a.length === b.length && 
        a.every((val, index) => val === b[index]);
}

// form validation function
function validateForm() {
    let responseText;
    if ($("#messageText").val() == "") {
        responseText = "Message field cannot be empty!";
    } else if ($("#fromName").val() == "") {
        responseText = "Name field cannot be blank!";
    } else if ($("#emailAddress").val() == "") {
        responseText = "Email field cannot be blank!";
    } else if (!validateEmail($("#emailAddress").val())) {
        responseText = "Email address is not valid!";
    }

    if (responseText === undefined) {
        sendEmail();
    } else {
        $(".progress-text").html(responseText);
        $(".progress-text").css("color", "red");
    }
}

// function to validate email address
function validateEmail(email) {
	if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(String(email).toLowerCase())) {
      	return true;
    }
    return (false);
}

// sendEmail function using emailJS API
function sendEmail() {
    let progressField = $(".progress-text");
    $(progressField).html("In Progress...");
    $(progressField).css("color", "orange");

    $(".form-control").prop('disabled', true);

    emailjs.send("service_hs5tljx","template_o9nml2i", {
        from_name: $("#fromName").val(),
        message_text: $("#messageText").val(),
        from_email: $("#emailAddress").val()
    })
        .then(function() {
            $(progressField).html("Email Sent! This window will now close");
            $(progressField).css("color", "green");

            window.setTimeout(function() {
                $("#feedbackModal").modal('hide');
                $(".form-control").prop('disabled', false);
            }, 5000);

        }, function(error) {
            $(progressField).html("An error occured...");
            $(progressField).css("color", "red");

            $(".form-control").prop('disabled', false);
        });
}