"use strict";
// TODO: Import something from the module.
import {duckMessage} from "./module.js"

/*
    JavaScript Basics
*/

function mySetupFunc() {

    // TODO: Log message to the box
    logMessage("Hello!")
    // TODO: Logging a message to the console
    console.log("Hello, console!");
    // TODO: Creating an object
    let car = {color: "green", year: 2002};
    logObject(car)
    // TODO: Creating a class
    class Car {
        constructor(color, year) {
            this.color = color;
            this.year = year;
        }

        start() {
            logMessage("The car has started!");
        }
    }

    let car2 = new Car("red", "1999");
    car2.start();

}

window.myInitFunction = mySetupFunc;

// TODO: Working with arrays (Console)

// TODO: Working with maps (Console)


/*
    Buttons
*/


var petCount = 0;
window.dogButtonFunc = function() {
    petCount += 1;
    document.getElementById("msg").innerHTML = `You have petted the dog ${petCount} time(s).`;
}


/*
    Text Input
*/

// Disable submission

document.getElementById("textform").addEventListener("submit", function(event) {
    event.preventDefault();
});

document.getElementById("textinput").onchange = function(event) {
    document.getElementById("enteredtext").innerText = event.target.value
}

/*
    Menus
*/

document.getElementById("myMenu").onchange = function(event) {
    document.getElementById("menuBox").style.backgroundColor = event.target.value;
}

document.getElementById("radioform").onchange = function(event) {
    document.getElementById("menuBox").style.borderStyle = event.target.value;
}


/*
    Sliders
*/

document.getElementById("slide").onchange = function(event) {
    document.getElementById("slidertext").innerText = "Slider Value: " + event.target.value;
    document.getElementById("sliderBox").style.borderRadius = `${event.target.value}px`;

}

/*
    Color Picker
*/

document.getElementById("colorpicker").onchange = function(event) {
    document.getElementsByTagName("body")[0].style.backgroundColor = event.target.value;

}

/*
    Input Events
*/

window.addEventListener('keydown', function(event) {
    this.document.getElementById("keydown").innerText = event.key;
});

window.addEventListener('keyup', function(event) {
    this.document.getElementById("keyup").innerText = event.key;
});

window.addEventListener('mousemove', function(event) {
    this.document.getElementById("mpos_x").innerText = event.x;
    this.document.getElementById("mpos_y").innerText = event.y;
});

var click_count = 0;
window.addEventListener('click', function(event) {
    click_count += 1;
    this.document.getElementById("click_count").innerText = click_count;
})



/*
    Timers
*/

var tic = true;

function myClock() {
    let message = tic ? "Tick!" : "Tock!";
    document.getElementById("tick").innerText = message;
    tic = !tic;
}

setInterval(myClock, 1000);


// Logging

function logMessage(message) {
    document.getElementById("messageBox").innerText += `[msg]: ${message}\n\n`;
}

function logObject(obj) {
    let message = JSON.stringify(obj, null, 2);
    document.getElementById("messageBox").innerText += `[obj]:\n${message}\n\n`;
}