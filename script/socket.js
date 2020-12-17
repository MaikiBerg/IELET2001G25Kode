var socket = io.connect('81.166.132.210:2520', {secure: false}); //This line declares a socket.io object to var "socket" and connects to the server GLOBALLY
var esp32array = 0;
var chatbox = document.getElementById("chatbox");
var brukernavn = "";
var list_LA = [];
var list_IP = [];
var list_UID = [];
var list_activity = [];

var key = 1;        //Totally not our "key" used for our encryption/decryption

//The "secure: false" tells if the connection will be encrypted or not. Since we will not encrypt our connections, this is false.

//Socket.io has several functions. The .on function refers to what will happen when the client receive a call called 'connect' from the server
//View it as calling a function remotley. The server tells the client it wants to call this function with no arguments.
socket.on('connect',function() { //When you connect to the server (and it works) call this function
    console.log('Client has connected to the server!'); //The client prints this message
}); //The 'connect' function/identifier is the standard procedure. To make something more we have to make it ourselves
socket.on('clientConnected',function(id, ip) { //This is our selfmade functions. Here we can have the server return arguments (data) that we need
    console.log('Client recevied ID: ' + id); //In this case the server will tell us what our local ID is (auto assigned)
    console.log("Client IP: " + ip);//And it will tell us what our IP-address
});

socket.on('somebody_disconnected', function(id, ip) {
    console.log('Client with ID: ' + id + ' and IP: ' + ip +' disconnected.');
});

socket.on("chatcontent", function(data) {
    chatbox.innerHTML = " ";        //Clear the field
    chatbox.innerHTML = data;       //Add new chatcontent
});


socket.on("userlist", function (data) {
    empty_userlist()
    list_LA = data[0];
    list_IP = data[1];
    list_UID = data[2];
    list_activity = data[3];
});
//When ESP32 responds to give me id request
socket.on("ESP32IDS", function (data) {
    esp32array = [...data]
    console.log(esp32array);
});

//Send message function that takes input arguments, who is sending and the content
function sendmessage(bruker, messagetosend) {
    console.log([bruker, messagetosend]);
    socket.emit("messageFromUser", [bruker, messagetosend]);
};
//Function to retrieve chat
function retrieveChat() {
    socket.emit("retrieveChat")
};

//Get userlist
function getuserlist() {
    socket.emit("getuserlist",0);
};


//Authentication and firebase
var username = prompt("Skriv inn brukernavnet ditt ", "1"); //This asks you for a username when the webpage first loads
var passwd = prompt("Skriv in passordet ditt", "1"); //This asks you for a password when the webpage first loads
brukernavn = username;
if(username != undefined && passwd != undefined) {  //If the username and password is actually entered, empty input will not send the auth request
    authUser(username, passwd); //Call the auth function on the client
}


function authUser(username, password) { //The auth function
    username_encrypted = shift_encryption(username, key);
    password_encrypted = shift_encryption(password, key);
    socket.emit('authenticate_user', username_encrypted, password_encrypted); //Emit encrypted username and password to server, then gets decrypted and checked with the database

    //Response from the server:
    socket.once('authentication_success', function(username, id, ip) { //If the server tells us "authSuccess", we are authenticated because the username/password matched with the db one
        console.log("User " + username + " was authenticated");
        alert("Du er logget inn"); //We are alerted with a message
        gimmeID(); //Once authenticated, fetch all ESP32 IDs
        getuserlist(); //Same goes for this
    });

    socket.once('authentication_fail', function(username) {  //If the server tells us "authFail", we are not authenticated because the username/password did not match
        console.log("User authentication with username " + username + " failed.");
        alert("Du tastet inn feil brukernavn eller passord."); //We are alerted with a message
        location.reload(); //This reloads the webpage so the user can not do anything if they dont manage to login
    });
};


//Function for plotting
function xAxisForPlotOne() {
    xcountermain = Math.max(xcounter1, xcounter2, xcounter3, xcounter4);
    if(xcountermain > xlabel0[xlabel0.length -1]) {//If new xcountermain value is bigger than last value of xlabel
        xlabel0.push(xcountermain); //Push new value
    };
};

function xAxisForPlotTwo() {
    xcountermain0 = Math.max(xcounter01, xcounter02, xcounter03, xcounter04);
    if(xcountermain0 > xlabel[xlabel.length -1]) {//If new xcountermain value is bigger than last value of xlabel
        xlabel.push(xcountermain0); //Push new value
    };
};

//Recieve data from board and sensor..

//HOUSE 1
socket.on('data00', function(data) { //Sensor temp
    console.log("data00" + data);
    dataArr1.push(Number(data));

    xcounter1++;

    xAxisForPlotOne()
    myLineChart.update();
});
socket.on('data01', function(data) { //Sensor light
    console.log("data01" + data);
    dataArr12.push(Number(data));
    xcounter01++;                   //Counter for xaxis count
    xAxisForPlotTwo();
    myLineChart2.update();

});

//HOUSE 2
socket.on('data10', function(data) {
    console.log("data10" + data);
    dataArr2.push(Number(data));
    xcounter2++;
    xAxisForPlotOne();
    myLineChart.update();
});
socket.on('data11', function(data) {
    console.log("data11" + data);
    dataArr22.push(Number(data));
    xcounter02++;
    xAxisForPlotTwo();
    myLineChart2.update()

});

//HOUSE 3
socket.on('data20', function(data) {
    console.log("data20" + data);
    dataArr3.push(Number(data));
    xcounter3++;
    xAxisForPlotOne();
    myLineChart.update();
});
socket.on('data21', function(data) {
    console.log("data21" + data);
    dataArr32.push(Number(data));
    xcounter03++;
    xAxisForPlotTwo();
    myLineChart2.update();
});

//HOUSE 4
socket.on('data30', function(data) {
    console.log("data30" + data);
    dataArr4.push(Number(data));
    xcounter4++;
    xAxisForPlotOne();
    myLineChart.update();
});
socket.on('data31', function(data) {
    console.log("data31" + data);
    dataArr42.push(Number(data));
    xcounter04++;
    xAxisForPlotTwo();
    myLineChart2.update();
});



//Function to request data from specific board and specific sensor
function requestDataFromBoard(interval, sensor, num) { //Sensor 0 for temp, sensor 1 for light. Num 0-3 for esp32
    socket.emit('requestDataFromOneBoard', [interval,sensor,num]); //Here we tell the server to call the function "requestDataFromBoard" with a argument called "intervall"
    //The intervall value is the period of time between each data transmit from the ESP32 to the server. Typical values can be everything form 100ms to 100s
    console.log("requestDataFromBoard was called with intervall: " + interval + ", Sensor: " + sensor + " HOUSE: " + num);
}; //Be careful to not set the interval value to low, you do not want to overflood your server with data/requests

function requestDataFromAllTemp(interval) { //Sensor 0 for temp, sensor 1 for light. Num 0-3 for esp32
    requestDataFromBoard(1000,0,0);
    requestDataFromBoard(1000,0,1);
    requestDataFromBoard(1000,0,2);
    requestDataFromBoard(1000,0,3);
  console.log("requestDataFromAll_temp was called with intervall: " + interval);
}; //Be careful to not set the interval value to low, you do not want to overflood your server with data/requests

function requestDataFromAllLight(interval) { //Sensor 0 for temp, sensor 1 for light. Num 0-3 for esp32
    requestDataFromBoard(1000,1,0);
    requestDataFromBoard(1000,1,1);
    requestDataFromBoard(1000,1,2);
    requestDataFromBoard(1000,1,3);
    console.log("requestDataFromAll_light was called with intervall: " + interval);
};

function stopDataFromAll() { //Tells the server to stop all timers so that data is no longer sent from the ESP32 to the webpage
    socket.emit('stopDataFromAll'); //Here we tell the server to call the function "stopDataFromBoard"
    console.log("stopDataFromAll was called");
};


//Function to obtain ESP32 IDs for individual control and communication
function gimmeID() {
    socket.emit('gimmeID');
    console.log("gimmeID requested")
};


//Function to
function controlLight(house,light,state) {
    socket.emit("controlLight", [house,light,state]);
    console.log("emitted ctrllight: " + [house,light,state])
};

//Empty user list
function empty_userlist() {
    list_LA = [];       //List last active
    list_IP = [];       //List IP
    list_UID = [];      //List user ID
    list_activity = []; //List active or not
};

//Encrypt and decrypt functions hidden in end of code ;)
function shift_encryption(inputString, keyshift) {

    var charASCII = 0;
    var outputEncoded = "";

    for(var i = 0; i<inputString.length; i++) {
        charASCII = (inputString[i].charCodeAt()) + keyshift;      //Make ascii char
        outputEncoded += String.fromCharCode(charASCII);
    };
    return outputEncoded
};

function shift_decryption(encodedString, keyshift) {

    var charASCII = 0;
    var outputDecoded = "";

    for(var i = 0; i<encodedString.length; i++) {
        charASCII = (encodedString[i].charCodeAt()) - keyshift;      //Make
        outputDecoded += String.fromCharCode(charASCII);
    };
    return outputDecoded
};

