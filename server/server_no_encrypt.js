//Imports
var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express(); //These 4 first variables can be viewed as importing 3 libraries we need for the server and then declaring the objects we need to use them (just like Arduino)

var serverPort = 2520; //We set the port the server will run on. This can be anything you want, as long as it does not interfere with other software

var server = http.createServer(app); //We declare and create a http server (this because the WebSocket protocol formally is a "upgraded" version of the HTTP protocol)
var io = require('socket.io').listen(server); //Then we start the WebSocket protocol on top of the HTTP server

var admin = require("firebase-admin");

var whole_chat = "";    //Variable for storing the whole chat in each server session, the WHOLE chat is stored in FireBase

var list_LA = [];       //List for Last Active
var list_IP= [];        //List for IP
var list_UID = [];      //List for userID
var list_status= [];    //List for status 0/1


var sKey = 1;       //totally not our encrypt/decrypt key

//function for encryption
function shift_encryption(inputString, keyshift) {

    var charASCII = 0;
    var outputEncoded = "";

    for(var i = 0; i<inputString.length; i++) {
        charASCII = (inputString[i].charCodeAt()) + keyshift;      //Make ascii char
        outputEncoded += String.fromCharCode(charASCII);
    }
    return outputEncoded
}

//function for decryption
function shift_decryption(encodedString, keyshift) {

    var charASCII = 0;
    var outputDecoded = "";

    for(var i = 0; i<encodedString.length; i++) {
        charASCII = (encodedString[i].charCodeAt()) - keyshift;      //Make
        outputDecoded += String.fromCharCode(charASCII);
    }
    return outputDecoded
}

//HTTP Server
server.listen(serverPort, function() { //Here we tell the server to start listening (open) on the port we earlier defined
    console.log('listening on *:' + serverPort);
});

//Firebase admin uplink
var serviceAccount = require("/server/gruppe25datakom-firebase-adminsdk.json");

var fAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gruppe25datakom.firebaseio.com/"
    }
);

//Firebase database config
var db = fAdmin.database();


//get date and time
//A function to generate the current date in a organized format as a string. We want to date our events.
function getDateAsString() {
    var currentDate = new Date(); //We use the JavaScript Date object/function and then configure it

    var currentMonth;
    var currentDay;

    if(currentDate.getMonth() < 10) {
        currentMonth = "0" + String(currentDate.getMonth()+1);  //0 indexed month, january is 0
    } else {
        currentMonth = String(currentDate.getMonth()+1);
    }

    if(currentDate.getDate() < 10) {
        currentDay = "0" + String(currentDate.getDate());
    } else {
        currentDay = String(currentDate.getDate());
    }

    var date = currentDate.getFullYear() + "." + currentMonth + "." + currentDay;
    return date; //returns the date string
}

//A function to generate the current time in a organized format as a string. We want to timestamp our events
function getTimeAsString() {
    var currentTime = new Date(); //We use the JavaScript Date object/function and then configure it

    var currentHour;
    var currentMinute;
    var currentSecond;

    if(currentTime.getHours() < 10) {
        currentHour = "0" + String(currentTime.getHours());
    } else {
        currentHour = String(currentTime.getHours());
    }

    if(currentTime.getMinutes() < 10) {
        currentMinute = "0" + String(currentTime.getMinutes());
    } else {
        currentMinute = String(currentTime.getMinutes());
    }

    if(currentTime.getSeconds() < 10) {
        currentSecond = "0" + String(currentTime.getSeconds());
    } else {
        currentSecond = String(currentTime.getSeconds());
    }

    var time = currentHour + ":" + currentMinute + ":" + currentSecond;
    return time; //returns the time string
}

//Registration key on register website
var registration_key = "passord";




//Counter for total visits
let total_visits = 0;

//Users of server "Lists"
const activeUsers = new Set();
const esp32users = new Set();
var ESP32USERS_ARRAY = ["","","",""]; //Make array with space for ESP32 IDS that will be used for individuall addressing

io.on('connection', function(socket) { //This is the server part of the "what happens when we first connect" function. Everytime a user connects a instance of this is set up for the user privatley
    console.log('a user connected'); //The server print this message
    total_visits += 1; //Add 1 to total visit count

    //clear these fields
    list_UID = [];
    list_IP = [];
    list_status =[];
    list_LA = [];

    //this User ID will be used for firebase userID
    var  register_user_ID= 0;


    //Client ID needs to be fetched
    var clientID = socket.id; //This is the actual clientID in alphanumeric characters (a string variable)
    var client = io.sockets.connected[clientID]; //This is the client object, each client has its own object (again like in Arduino declaring a object)
    //client.emit("clientConnected", clientID); THIS SHOULDNT BE HERE I THINK
    console.log("User ID: " + clientID);
    activeUsers.add(clientID);
    console.log(activeUsers);
    //Client IP
    var clientIPRAW = client.request.connection.remoteAddress; //Fetch the IP-address of the client that just connected

    var IPArr = clientIPRAW.split(":",4); //Split it, which is to say reformat the fetched data
    console.log("User IP: " + IPArr[3]); //Print out the formated IP-address

    io.emit("clientConnected", clientID, IPArr[3]); //Now we can use our custom defined "on connection" function to tell the client its ID and IP-address


    //Disconnect protocol
    client.on('disconnect', function() { //This function is called for a client when the client is disconnected. The server can then do something even tough the client is disconnected
        console.log("user " + clientID + " disconnected, stopping timers if any");
        activeUsers.delete(clientID);
        esp32users.delete(clientID); //Delete disconnected users
        socket.broadcast.emit('somebody_disconnected',clientID);
        for (var i = 0; i < timers.length; i++) {//clear timer if user disconnects
            clearTimeout(timers[i]); //Cleartimer is the same as stopping the timer, in this case we clear all possible timers previously set
        }
        //When the user disconnects we want to log and store this in the database
        if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //This checks that the user is logged in via the register_user_ID

            //stopListeningForData(); //Stop client data stream, new database entries will not be sent to the socket client

            var currentDate = getDateAsString(); //Get the date
            var currentTime = getTimeAsString(); //Get the time
            var currentDateTime = currentDate + " | " + currentTime; //Put the date and time together

            db.ref('users/' + register_user_ID).update({ //Here we make a call to our database to update our user in the users directory of the database
                is_active: 0, //We set the sures to not-active
                last_active: currentDateTime, //We timestamp the last time the user was logged on (which is to say when they logged of)
                ip_address: IPArr[3] //We log the last known IP-address of the user, in case this could be usefull
            }).then((snap) => { //The .then function is called after a sucessfull call/request to the databas
                console.log("User " + register_user_ID + " updated last_active to " + currentDateTime + " and ip_address to " + IPArr[3]);
                console.log("User " + register_user_ID + " is no longer ative"); //We console log some properties about the user
            });
        }
    });

    socket.on("regUser", function(key, username, password) {

        if(key == registration_key) {
            console.log("---------User registration--------");
            console.log("Username: " + username);
            console.log("Password: " + password);

            var registrationDate = getDateAsString();               //Hent inn dato når bruker registreres
            var currentTime = getTimeAsString();                    //Hent inn tid

            console.log(registrationDate);
            console.log(currentTime);

            db.ref('users/').push( {
                username: username,
                is_active: 1,
                last_active: registrationDate + "|" + currentTime,
                password: password,
                register_date: registrationDate,
                ip_address: IPArr[3]
            }).then((snap) => {

                console.log("Data was sent to server and user: " + username + " was registered");
                client.emit("registration_success", username);
                console.log("----- End User Registration. -----");
            });
        } else {
            console.log("Register key does not match, you are not allowed to register a user...")
            client.emit("registration_denied");
        }
    });

    socket.on("authenticate_user", function (username, password) {      //All info sendt til node er ukryptert, kan leses i wireshark
        //Decrypt incoming messages from client
        username = shift_decryption(username,sKey);
        password = shift_decryption(password,sKey);

        var data = db.ref("users").orderByChild("username").equalTo(username);

        data.once("value", function(snap) {

        }).then((snap) => {

            if(snap.numChildren() == 1) {       //How many data points match

                console.log("User exists");
                var value = snap.val();     //Henter ut value av objektet
                console.log(value);

                var user_ID = Object.keys(value) //AUTOMATIC USER ID IN FIREBASE
                //This User ID will be used for firebase

                var output = value[user_ID];
                console.log(output);        //SKRIV UT ALT

                if(output.password == password) {
                    console.log("Username and password matches, user is authenticated");
                    register_user_ID = user_ID;                                             //assign user id if and when username and password is correct
                    client.emit("authentication_success", username,user_ID,IPArr[3]);
                    console.log(register_user_ID);

                    if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //We use the same check as in disconnected to see if the user is registered on the Node/Socket server
                        var currentDate = getDateAsString(); //Get date
                        var currentTime = getTimeAsString(); //Get time
                        var currentDateTime = currentDate + " | " + currentTime; //Fusion them together

                        db.ref('users/' + register_user_ID).update({ //Tell the database that the user has logged in and is now active
                            is_active: 1, //The user is active
                            last_active: currentDateTime, //Save the last_active time of a user to now
                            ip_address: IPArr[3] //Save the IP-address of the user
                        }).then((snap) => { //When the user update has been saved
                            console.log("User " + register_user_ID + " updated last_active to " + currentDateTime + " and ip_address to " + IPArr[3]);
                        });
                    };

                } else {
                    console.log("User password does not match.");
                    client.emit("authentication_fail"); //Tell the client that the authentication has failed
                };
            } else {
                console.log("Error finding users, either too many or none. ");
                client.emit("authentication_fail"); //Tell the client that the authentication has failed

            }

        });

    });


    //Handle getuserlist from website client
    socket.on("getuserlist", function() {
        if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated
        list_UID = []
        list_IP = []
        list_status =[]
        list_LA = []

            //Get user data from firebase
        db.ref("users").on("value", function(snapshot) {
            snapshot.forEach(function (data) {

                //Add information about f.ex. username to liste userid
                list_UID.push(data.val().username);
                list_LA.push(data.val().last_active);
                list_IP.push(data.val().ip_address);
                list_status.push(data.val().is_active);

            });
            console.log(list_UID + " - " + list_IP + " - " + list_LA + " - " + list_status)
            io.emit("userlist", [list_LA, list_IP, list_UID, list_status]); //Emit userlist back
        });
        } else {
            console.log("User is not authenticated");
        }
    });

    //Handle messagefromuser from website client.
    socket.on("messageFromUser", function(data) {
        if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated

        console.log("We got a message from, " + data[0] +" , with the content: " + data[1]);
        whole_chat +=  data[0] + "@" + getTimeAsString() +" - " +data[1];

        db.ref('chat/').update( {       //upload message to firebase
            text: whole_chat
        })

        io.emit("chatcontent", whole_chat);

        } else {
            console.log("User is not authenticated");
        }
    });

    //When website client wants to recieve chat
    socket.on("retrieveChat", function () {
        if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated

            io.emit("chatcontent", whole_chat);//Send the whole chat (of the server session)
        } else {
            console.log("User is not authenticated");
        }
    })


    var timers = []; //Stores all our timers

        //When website client wants to recieve data from a specific board and sensor
        socket.on('requestDataFromOneBoard', function(data) {
            if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated
                console.log("user " + clientID + " requested data with intervel (ms): " + data[0] + " for sensor number: " + data[1] + "  to house number: " + data[2]);
                if(data[0] > 99) {
                    timers.push(
                        setInterval(function() {
                            console.log("SENDING DATAREQUESTSPECIFIC TO ESP32 WITH ID: " + ESP32USERS_ARRAY[data[2]]);
                            io.to(ESP32USERS_ARRAY[data[2]]).emit("dataRequestSpecific",[data[1]]);
                        }, data[0])
                    );
                } else{
                    console.log("Too short time interval!");
                }
            }else {
                console.log("User is not authenticated");
            }

});
        //When website client wants to stop data
    socket.on('stopDataFromAll', function() { //This function stops all the timers set by a user so that data will no longer be sent to the webpage

        if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated
            console.log('user ' + clientID + ' cleared data request interval');

            for (var i = 0; i < timers.length; i++) {//For loop to clear all set timers
                clearTimeout(timers[i]); //Cleartimer is the same as stopping the timer, in this case we clear all possible timers previously set
            }
        }else {
            console.log("User is not authenticated");
        }

    });
    //When data comes in from board
    socket.on('dataFromBoard', function(data) { //This is function that actually receives the data. The earlier one only starts the function.

        io.emit('data', data); //Everytime a "dataFromBoard" tag (with data) is sent to the server, "data" tag with the actual data is sent to all clients
        //This means the webbrowser will receive the data, and can then graph it or similar.
        console.log('user ' + clientID + ' gained the data: ' + data);

        //Everytime the mcu sends the server data it is stored in the database (this is permanent storing, the data is only deleted if you do it yourself)
        db.ref('sensordata/'/* + regUID*/).push({ //One can store data in a subdirectory for the user in sensordata by removing the comment inside .ref
            /* UID: regUID, If you choose to have data ownership stored per entry the microcontroller would have to be authenticated */
            mmac: ESP32USERS_ARRAY.indexOf(clientID), //You could add an ekstra variable to every dataFromBoard transmission with a microcontrollerID to lessen the need for authentication
            data: data, //This would be the sensor data, eg a temperature datapoint
            ip_address: IPArr[3] //What is the IP-address of the unit that logged the data
        }).then((snap) => { //When the data has been successfully saved
            console.log("Sensordata was saved");
        });
    });

    //Function to save temperature data
    function saveTempDataToFirebase(data) {
        db.ref('sensordatatemp/').push({
            mmac: ESP32USERS_ARRAY.indexOf(clientID), //You could add an ekstra variable to every dataFromBoard transmission with a microcontrollerID to lessen the need for authentication
            data: data, //This would be the sensor data, eg a temperature datapoint
            ip_address: IPArr[3] //What is the IP-address of the unit that logged the data
        }).then((snap) => { //When the data has been successfully saved
            console.log("Sensordata was saved");
        });
    }
    function saveLightDataToFirebase(data) {
        db.ref('sensordatalight/').push({
            mmac: ESP32USERS_ARRAY.indexOf(clientID), //You could add an ekstra variable to every dataFromBoard transmission with a microcontrollerID to lessen the need for authentication
            data: data, //This would be the sensor data, eg a temperature datapoint
            ip_address: IPArr[3] //What is the IP-address of the unit that logged the data
        }).then((snap) => { //When the data has been successfully saved
            console.log("Sensordata was saved");
        });
    }

//Handling data coming from boards
        socket.on('dataFromBoardZeroSensorOne', function(data) {
            saveLightDataToFirebase(data);
            io.emit('data01',data); //Every time we get data send it with data01 tag
            console.log("We got dataFromBoardZeroSensorOne user" + clientID + " gained the data: " + data);
        });
        socket.on('dataFromBoardZeroSensorZero', function(data) {
            saveTempDataToFirebase(data);
            io.emit('data00', data);
            console.log("we got dataFromBoardZeroSensorZero used"+ clientID + "gained the data: " + data);
        });

        socket.on('dataFromBoardOneSensorOne', function(data) {
            saveLightDataToFirebase(data);
            io.emit('data11',data); //Every time we get data send it with data01 tag
            console.log("We got dataFromBoardOneSensorOne user" + clientID + " gained the data: " + data);
        });

        socket.on('dataFromBoardOneSensorZero', function(data) {
            saveTempDataToFirebase(data);
            io.emit('data10', data);
            console.log("we got dataFromBoardOneSensorZero used"+ clientID + "gained the data: " + data);
        });

        socket.on('dataFromBoardTwoSensorOne', function(data) {
            saveLightDataToFirebase(data);
            io.emit('data21',data); //Every time we get data send it with data01 tag
            console.log("We got dataFromBoardTwoSensorOne user" + clientID + " gained the data: " + data);
        });
        socket.on('dataFromBoardTwoSensorZero', function(data) {
            saveTempDataToFirebase(data);
            io.emit('data20', data);
            console.log("we got dataFromBoardTwoSensorZero used"+ clientID + "gained the data: " + data);
        });

        socket.on('dataFromBoardThreeSensorOne', function(data) {
            saveLightDataToFirebase(data);
            io.emit('data31',data); //Every time we get data send it with data01 tag
            console.log("We got dataFromBoardThreeSensorOne user" + clientID + " gained the data: " + data);
        });
        socket.on('dataFromBoardThreeSensorZero', function(data) {
            saveTempDataToFirebase(data);
            io.emit('data30', data);
        console.log("we got dataFromBoardThreeSensorZero used"+ clientID + "gained the data: " + data);
        });



        //When website client requests esp32 IDS for individuall light control and sensor reading
        socket.on('gimmeID', function() {
            if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated
                io.emit('idFromBoard',0);   //Emit this to all connected devices, the ESP32s will then listen out for this and respond
                console.log("IDREQUESTED from ID: " + socket.id); //socket.id and ClientID is same
            }else {
                console.log("User is not authenticated");
            }

        });

        socket.on('responseFromBoard', function(data) { //When board responds we can fetch its ID and its MMAC (makeshift mac, 0-3)
        io.emit("relayResponseFromBoard", socket.id); //Send the board's ID
        console.log("ESP32 ID: "+ socket.id);
        ESP32USERS_ARRAY[data] = socket.id;     //The esp32 responds with "data" that is its makeshift mac address
        console.log(ESP32USERS_ARRAY);
        esp32users.add(socket.id);              //Add esp32ID to esp32users set
        socket.broadcast.emit("ESP32IDS", ESP32USERS_ARRAY);    //Broadcast the ESP32users array, its makeshift mac address determines its position in the array
        console.log([...esp32users]);
        });
        //Controllight request from server takes in array containing which esp32 and what light we want to controll.
        socket.on("controlLight", function(data) {
            if(register_user_ID != undefined && register_user_ID != "" && register_user_ID != 0) { //Check if the user is authenticated
                io.to(data[0]).emit("lightcontrol", [data[1],data[2]]);
                console.log("ctrllightrequested: " + data[0] +" "+ data[1] + " " +data[2]);
            }else {
                console.log("User is not authenticated");
            }
});
});







