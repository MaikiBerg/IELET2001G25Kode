#include <analogWrite.h>    //Import the analogWrite library for ESP32 so that analogWrite works properly

#include <WiFi.h>           //Imports the needed WiFi libraries
#include <WiFiMulti.h>      //We need a second one for the ESP32 (these are included when you have the ESP32 libraries)

#include <SocketIoClient.h> //Import the Socket.io library, this also imports all the websockets

WiFiMulti WiFiMulti;        //Declare an instane of the WiFiMulti library
SocketIoClient webSocket;   //Decalre an instance of the Socket.io library


int R_PIN = 15;           //Set Red LED to pin 15
int G_PIN = 2;            //Set Green LED to pin 2
int B_PIN = 0;            //Set Blue LED to pin 0
int Y_PIN = 4;            //Set Yellow LED to pin 4
int NTC_PIN = 34;         //Set NTC-termistor to pin 34
int fotores = 25;         //Set Photoresistor to pin 25
float aRead = 0;          //Analog avlesning
int lightval = 0;         //Light value set to zero
float temp = 0;           //Temperatur
float R = 0;              //Termistor resistans
float b = 3950;           //Termistor verdi
float R_0 = 10000;        //10k resistans
float T_0 = 22+273.15;    //Start temp (rommet)
int ESP32NUM = 1;         //Makeshift MAC address (MMAC) 

void event(const char * payload, size_t length) { //Default event, what happens when you connect
  Serial.printf("got message: %s\n", payload);    //Prints the payload
}

void dataRequestSpecific(const char * DataRequestSpecificData, size_t length) {//This is the function that is called everytime the server asks for data from the ESP32
  Serial.printf("Datarequest Data: %s\n", DataRequestSpecificData);
  Serial.println(DataRequestSpecificData);

  //These two lines converts the data from string to int 
  String dataString(DataRequestSpecificData[1]);
  int RequestState = dataString.toInt();

  Serial.print("This is the Datarequest Data in INT: "); //Prints the request state that is previously converted to int
  Serial.println(RequestState);
  
  Serial.printf("Datarequest Data: %s\n", DataRequestSpecificData); //Prints the specific data from the data request by the sever
  Serial.println(DataRequestSpecificData);

  Serial.println(DataRequestSpecificData[1]);

  if(RequestState == 0) { //If the datarequest gives the variable 0, do this (default)
    
    char str[10]; //Decalre a char array (needs to be char array to send to server)

    
//////////////TEMP//////////////////
    aRead = analogRead(NTC_PIN);                        //Reads the value from the NTC pin
    R = aRead/(4095-aRead) * R_0;                       //Calculates the termistor resistanse
    temp = - 273.15 + 1/((1/T_0) + (1/b)*log(R/R_0));   //Calculates the tamperature in Celsius
    

    itoa(temp, str, 10);            //Use a special formatting function
    Serial.print("ITOA TEST: ");    
    Serial.println(str);            //Prints the value
    
    webSocket.emit("dataFromBoardOneSensorZero", str); //Here the data is sendt to the server and then the server sends it to the webpage
    //Str indicates the data that is sendt every timeintervall, you can change this to "250" and se 250 be graphed on the webpage
  }
    if(RequestState == 1) { //If the datarequest gives the variable 1, do this (default)
    
    char str[10]; //Decalre a char array (needs to be char array to send to server)
    

   /////////////////LIGHT/////////////
    aRead = analogRead(fotores);              //reads the value from the fotores pin
    lightval = (aRead/4095) * 100;            //To get the light value in percent

    
    itoa(lightval, str, 10);                  //Use a special formatting function
    Serial.print("ITOA TEST one: ");
    Serial.println(str);                      //Prints the value
    Serial.println("we printin second sensor now");
    webSocket.emit("dataFromBoardOneSensorOne", str); //Here the data is sendt to the server and then the server sends it to the webpage
    //Str indicates the data that is sendt every timeintervall, you can change this to "250" and se 250 be graphed on the webpage
  }
}


void getID(const char * idRequestData, size_t length){     //The function that is called when the sever is asking for IDs
  String esp32str = String(ESP32NUM);                      //This is the number of the ESP32 aka the Makeshift MAC address (MMAC)
                                                           //This is induvidual for each ESP32         
  
  webSocket.emit("responseFromBoard", esp32str.c_str());   //Send specially formated data (MMAC) bac to server
  };
  
void controlLight(const char * lightData, size_t length){  //This is the function that is called when the server wants to control the lights
  Serial.printf("Datarequest Data: %s\n", lightData);      
  Serial.println(lightData);                               //Prints the light data

  Serial.println(lightData[1]);
  Serial.println("----");
  Serial.println(lightData[3]);

  String lednum = String(lightData[1]);                    //lightData[1] is the number of the LED
  String lightstate = String(lightData[3]);                //lightData[3] is the state of the LED (on or off)

  if(lednum.toInt() == 1){
    digitalWrite(R_PIN, lightstate.toInt());               //Turns on/off the red LED
    };
  if(lednum.toInt() == 2){
    digitalWrite(G_PIN, lightstate.toInt());               //Turns on/off the green LED
    };
      if(lednum.toInt() == 3){
    digitalWrite(B_PIN, lightstate.toInt());               //Turns on/off the blue LED
    }
     if(lednum.toInt() == 4){
    digitalWrite(Y_PIN, lightstate.toInt());               //Turns on/off the yellow LED
    }
  }
  

void setup() {
    Serial.begin(9600); //Start the serial monitor

    //Declares the LEDs as OUTPUTS and sensors as INPUTS
    pinMode(R_PIN, OUTPUT);
    pinMode(G_PIN, OUTPUT);
    pinMode(B_PIN, OUTPUT);
    pinMode(Y_PIN, OUTPUT);
    pinMode(NTC_PIN, INPUT);
    pinMode(fotores, INPUT);
    
    Serial.setDebugOutput(true); //Set debug to true (during ESP32 booting)

    Serial.println();            //Does this to make room in the serial monitor so that its more readable and clear
    Serial.println();
    Serial.println();

      for(uint8_t t = 4; t > 0; t--) { //More debugging
          Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
          Serial.flush();
          delay(1000);
      }
/*
    WiFiMulti.addAP("OnePlus 6", "Fffwww123"); //Add a WiFi hotspot (addAP = add AccessPoint)
    while(WiFiMulti.run() != WL_CONNECTED) { //Here we wait for a successfull WiFi connection untill we do anything else
      Serial.println("Not connected to wifi...");
        delay(100);
    }
    */
   WiFi.begin("Morkeseth 2-4", "Nyheim63phm");  //Trying to cennect this network

    while(WiFi.status() != WL_CONNECTED) {      //While internet is not connected, print connecting to wifi every 100 ms
      delay(100);
      Serial.println("Connecting to WiFi...");
      }
      
    Serial.println("Connected to WiFi successfully!"); //When we have connected to a WiFi hotspot

    //Here we declare all the different events the ESP32 should react to if the server tells it to.
    //a socket.emit("identifier", data) with any of the identifieres as defined below will make the socket call the functions in the arguments below
    webSocket.on("clientConnected", event); //For example, the socket.io server on node.js calls client.emit("clientConnected", ID, IP) Then this ESP32 will react with calling the event function

    //Send data to server/webpage
    webSocket.on("dataRequestSpecific", dataRequestSpecific);
    webSocket.on("idFromBoard", getID);
    webSocket.on("lightcontrol", controlLight);
    webSocket.begin("81.166.132.210", 2520); //This starts the connection to the server with the ip-address/domainname and a port (unencrypted)
}


void loop() {
  webSocket.loop(); //Keeps the WebSocket connection running 
  //DO NOT USE DELAY HERE, IT WILL INTERFER WITH WEBSOCKET OPERATIONS
  //TO MAKE TIMED EVENTS HERE USE THE millis() FUNCTION OR PUT TIMERS ON THE SERVER IN JAVASCRIPT
}
