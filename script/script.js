//Start with defining all the key elements on the webpage.

var lightSlider;
var currentESP32ID = 0;
var currentLight = 0;

var sendmsg = document.getElementById("sendmsg");
var msginput = document.getElementById("msginput");
var chatbox = document.getElementById("chatbox");

//Chat functionalities
sendmsg.onclick = function() {
    var message = msginput.value + "<br>";      //Add newline to end of every message;
    msginput.value = ""; //Clear input field

    sendmessage(brukernavn, message);
    console.log("send message was clicked and we tryna send:" + message);

};


function sliderFunction(inArg) {
    // Get the checkbox
    lightSlider = document.getElementById(inArg);
    currentESP32ID = esp32array[parseInt(lightSlider.id.substring(1,2))-1]; //Get ID from array using ID of button number (-1 for array indexing)
    console.log(currentESP32ID)
    currentLight = parseInt(lightSlider.id.substring(3,4));
    console.log(currentLight)
    if (lightSlider.checked == true) { //Here we declare the onoff state for the LEDs
        console.log(lightSlider.id+"on");
        controlLight(currentESP32ID,currentLight,1)
    } else {
        console.log(lightSlider.id+"off");
        controlLight(currentESP32ID,currentLight,0)

    };
};


//Keypress handling
document.onkeypress = function(event) { //This checks constantly if, while on the webpage, the user presses down a button
    keyDown(event); //If a user does press down a button the "event" variable fetches which button it is and passes it to the function "keyDown" as an argument
};
var btnPressed = false; //Variable to track if the user is currently pressing down a button

function keyDown(event) { //This function performs certain actions when a user presses down certain buttons
    var key = event.key; //Gets the key on the keyboard to check if something should be done
    if(key === "Enter") {
        sendmsg.click(); //Click the sendmsg button
    }
    if(!btnPressed) { //If any other button is not allready pressed, continue
    };
};

//Function to add data to table
function addDataToTable(LA,IP,UID,status) {
    var table = document.getElementById("rows");

    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = UID;
    cell2.innerHTML = IP;
    cell3.innerHTML = LA;
        //If user is connected, display green color
    if(status == 1) {
        cell1.style.color = "green";
        cell2.style.color = "green";
        cell3.style.color = "green";
    } else {
        cell1.style.color = "red";
        cell2.style.color = "red";
        cell3.style.color = "red";
    };
};

function clearTable() {
    var table = document.getElementById("rows");
    table.innerHTML = "";                           //empty the table before filling it
    //Make new table
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.outerHTML = "<th>User</th>";
    cell2.outerHTML = "<th>IP</th>";
    cell3.outerHTML = "<th>Last login</th>";
};

function filltable(){
    clearTable();       //Clear the table before adding all users info
    for(var i = 0; i<list_UID.length;i++) {
        addDataToTable(list_LA[i],list_IP[i],list_UID[i],list_activity[i])
    };
};


