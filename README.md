# Winden

## A Story Game

![Infinity Logo](/assets/images/infinity.png)

## Contents

1. [UX](#ux)
    * [Project Goals](#project-goals)
    * [User Goals](#user-goals)
    * [Site Owner Goals](#site-owner-goals)
    * [User Requirements and Expectations](#user-requirements-and-expectations)
2. Technologies
3. Features
4. Testing
5. Bugs
6. Deployment
7. Credit

## UX

### Project Goals

The goal of this project was to make a game which focused on player choice and which plays out differently depending on the choices the player makes. The story in this game is a loose adaptation of the Netflix series [Dark](https://www.youtube.com/watch?v=ESEUoa-mz2c), heavily simplified in order to make it manageable. 

### User Goals

* Be engaged with an interesting story
* Easy to use controls
* Images and text that fit the scene
* Choices that have a tangible impact on the game
* Endings that fit the choices I made
* Contact the developer to give feedback
* Information about the inspiration behind the game

### User Stories

* As a user, I want to be able to play a story driven game.
* As a user, I want to be able to make choices as part of the game and I want my choices to impact the story of the game.
* As a user, I want each scene to be descriptive and have images to set the scene for me and help immerse me in the game.
* As a user, I want to be able to contact the game maker with suggestions or feedback I have about the game.

### Site Owner Goals

* As a site owner, I want the game and controls to be easy to understand and use.
* As a site owner, I want the color scheme and layout of the game to be reflective of the game.
* As a site owner, I want to communicate the story of *Dark* effectively and coherently.
* As a site owner, I want everything on the site to be contained on one web page.
* As a site owner, I want the users to be able to communicate with me if they want and find out more information about the series/game.

### User Requirements and Expectations

#### Requirements

* Game scene area that changes when users use controls
* Easy to use controls
* Story for game that adapts based on player choices
* Images for scenes that help put player in setting
* Site owner contact form
* Clear page design and outline

#### Expectations

* Clear and consistent colour scheme
* Rich player choice
* Further information about the story

### Design Choices

The game structure and design is heavily influenced by TellTale Games' work including games like *Tales From the Borderlands*, *The Wolf Among Us* and *The Walking Dead* amongst others.

![Wolf Among Us Screenshot](/assets/images/wolf-among-us-screenshot.jpg)

I have always enjoyed their take on the story driven game and their template of scene and options was incorporated into the design.

To achieve this, I decided on a set game container area which would house the scene image and text, and then a seperate controls container, separate from the game container to house the controls which would be generated based on the scene.

A key part of the *Dark* series is recurring locations where significant events in the series take place. I therefore decided to make part of the game exploring various locations pulled from the series, rather than a linear story.

I also wanted the site to focus on the game, with little excess. As such I decided on a one page site with the game as it's main content. I decided to store additional infomation/functionalities in modals as I didn't want to clutter the page with anything else other than the game scene and controls.

#### Colours  

The story of *Dark* is quite *dark* (pun intended) and I wanted the colour scheme of the site to reflect that. As such, I went for a dark black/grey colour scheme for the site, contrasted with the off-white/white colour of the text and images.

![Dark Colour Palette](/assets/images/dark-pallete.png)

#### Fonts

I felt the font for the site should be serious and pointed, mimicing the title of the series. For that I chose [Montserrat](https://fonts.google.com/specimen/Montserrat).

![Dark Title](/assets/images/dark-title.jpg)

#### Images

For the scene images, I didn't want to use images pulled from multiple sources as I felt it would ruin the consistency and theme of the site. Keeping the theme and scene images consistent in format, colour and size was very important to me as I felt it would help immerse the player in the experience. 

I found a site with thousands of images that suited my needs perfectly. The site is [game-icons.net](https://game-icons.net/). It is a library of game icons available under the creative commons licence and it's scope is quite breathtaking. It also has image parameters which can be changed to suit different needs. It was perfect for my needs.

![Baobab Image](/assets/images/baobab.png)

### Wireframing

I used *Balsamiq* to draw up wireframes for this site. I wanted the site to focus on the game, with no excess, the wireframes reflect that. With the one page design that I chose for the site, I designed the wireframes with a minimal nav section, a large game scene area and large buttons beneath them that would wrap depending on the quantity of buttons and the screen size.

You can view more wireframes of additional scenes [here.](/assets/wireframes/dark-wireframes.pdf)

![Wireframe](/assets/images/dark-wireframe.png)

### Data Structure

#### Overview

The story for *Dark* is quite complex outside of the scope of the game. Initially, I envisioned a 13 day, time-travelling story with story sequences at each location on each day, in each timeline. The initial plan for this can be found [here](/assets/misc/story-plan.xlsx).

![Story Plan](/assets/images/story-plan.png)

However, when I began adapting the story, I quickly realized that this would take far too long and I was forced to cut the story down to the size of one day in one timeline. Despite this shortening, the story I finally wrote still to hundreds of scenes. It therefore became necessary to store the story structure in a seperate JSON file.

#### Objects

##### Locations

There are a few different data structures contained in the story json file. The first object type is the location. I started with different locations that are key to the story of *Dark* and then drew up a map of how I would connect them. You can see that map below.

![Location Map](/assets/images/map-diagram.png)

The *Location* objects in the json file have a *locationId*, which is just their position in the *locations* array, a *locationName* which is the name of the location, a *connectedLocations* array which is an array of the *locationId*'s that it is connected to, and an *image* which is the image to be displayed when at the location.

    {
            "locationId": 0,
            "locationName": "Kahnwald House",
            "connectedLocations": [1, 11, 9],
            "image": "kahnwald_house_white.png"
    }

The end result looks like this when processed by the game engine.

![Location Example](/assets/images/location-example.png)

##### Sequences

Every location has a corresponding sequence object that will trigger when the player *Enters* the location. Each sequence has a *sequenceId* which refers to it's position in the *sequences* array, a *sequenceName* which is never seen by the player but helps me as a developer keep track, a *locationId* which is the *id* of the location that the sequence occurs at, and a scenes array which contains all the scenes for that sequence.

    {
                "sequenceId": 4,
                "sequenceName": "Alexander Tiedeman Encounter",
                "locationId": 5,
                "scenes": [
                    {
                        "sceneId": 0,
                        "text": "As you approach the gate entrance to the plant you see a man pull up to the gate in a new Mercedes car. The gate opens for him immediately. As he passes you, he stops and rolls down his window. Alexander Tiedeman leans his head out of the car. 'Hello Jonas, here looking for a job?' He laughs.",
                        "sceneImage": "city-car.png",
                        "options": [
                            {
                                "optionText": "Just having a look around",
                                "nextScene": 1,
                                "dependantVariables": []
                            },
                            {
                                "optionText": "I am",
                                "nextScene": 2,
                                "dependantVariables": []
                            }
                        ]
                    }, 

##### Scenes

Scene objects have a *sceneId*, which refers to the scene's position in that sequence's scenes array, a *text* which is the text to be displayed to the player when at that scene, *sceneImage* which refers to the image to be displayed for that scene and an *options* array, which contains the option objects for that scene. *Option* objects have a *optionText* attribute which is the text that the option should display, a *nextScene* which refers to the next scene object that the button click should direct to and a *dependantVariables* array which, initially, was meant to contain an array of variables (conditions) which would have to be met before the option would display for the user. However, due to time constraints, this attribute is not used. 

    {
        "sceneId": 15,
        "text": "'You know you don't have to go to school if you don't want to, you still need time to heal' As she walks by you detect the faint smell of aftershave on her neck, certainly not one that you recognise as belonging to your father.",
        "sceneImage": "perfume_white.png",
        "options": [
            {
                "optionText": "I need to get out of the house.",
                "nextScene": 16,
                "dependantVariables": []
            },
            {
                "optionText": "Why is the Milk gone off?",
                "nextScene": 17,
                "dependantVariables": []
            },
            {
                "optionText": "Was there someone upstairs with you?",
                "nextScene": 18,
                "dependantVariables": []
            }
        ]
    },

A scene looks like this.

![Scene Example](/assets/images/scene-example.png)

## Features

### Existing Features

* Game that changes reacts to user input
* Story adapted from TV series
* Player choices in game that impact story
* Endings that reflect player choices
* Consistent and thematically correct design
* Simple, easy to understand and understand interface
* *About* modal that contains additional information about game
* *Feedback* modal that allows players to submit feedback about game


When I was thinking about ideas for my second milestone project my immediate conclusion was that I wanted to make a game. I have been playing games as long as I can remember and, although I'm not sure I want to make games full-time, I was sure I wanted to try my hand at making one for myself. With MS2 focusing so much on interactivity through Javascript and manipulation of the DOM, I decided that this was the perfect time to test this. I also had previous experience with JavaScript and so felt confident I could pull it off.

The games that I have enjoyed most growing up have been games that focus on story and player choice and so I decided that I wanted my game to focus on dialogue and text rather than complex animations and art which would take too much time to do. In this regard I looked at old school text based role playing games like *Zork*, *A Hitchiker's Guide To The Galaxy* and others. However, I also focused on modern examples of the genre. In particular, games like TellTale Games'  *The Wolf Among Us*, *The Walking Dead*, *Tales From The Borderlands* as well as games like **Disco Elysium** and RPG classics like the *Fallout* and *Skyrim* series. The TellTale Games template felt like a good fit for the game I envisioned, their focus on the story, the scenes and the dialogue options within that matched the project I envisioned.

The next step of course was to craft a story. Initially I looked at Fantasy settings where I could encorporate different features like class selection, combat, inventory systems, weapons and spells. However, on further consideration I realised that the scope and size of such a setting would be difficult to manage given the time frame and so I decided not to persue such a setting. Instead I decided I wanted to simply focus on narrative driven game where dialogue choices would dictate the flow of the game. At the time, I was engrossed in a Netflix show called *Dark*. *Dark* is a sci-fi series, with such elements as time travel, quantum theory and the likes abound, but it never gets too carried away with the complex scinence surrounding it's central plot, instead focusing on the interactions between it's characters and the consequences of the decisions they make. I felt it was a perfect story to adapt for my game.

However, the story of *Dark* is extremely complex and would be difficult to explain outside of the context of a game, so I was forced to heavily simplify the main story to keep the size and scope of the game manageable and focus on key events and scenarios rather than delving too heavily into it's complex story.


