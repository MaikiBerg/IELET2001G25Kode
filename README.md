# IELET2001G25Kode
Dette er kodedelen av prosjektinnleveringen, i tillegg kommer også setup instruksene.

Du finner [koden](server/server_no_encrypt.js) for serveren/tjeneren i mappen [server](server/)

Du finner tilhørende [kode](ESP32/Kode_ESPnr1.ino) og [koblingsskjema](ESP32/Smarthus_koblingsskjema.JPG) for ESP32en i mappen [ESP32](ESP32/)

Dersom portene er åpne, serveren er oppe, vi fremdeles har domenet og samme IP-addresse kan du prøve å besøke her: http://ielet2001g25.ddns.net/


## OPPSETT AV IELET2001 G25 "SMARTHUS"

1. Finn frem tastatur, mus, skjerm og HDMI kabel.

2. Dersom du allerede har et SD kort med operativsystem innstallert, hopp over dette steget.
 	Installer operativsystem til raspberry pi på et SD kort som rommer mer enn 8GB.
	https://www.raspberrypi.org/software/ 


3. Sett inn SD kortet og følg instruksene på https://www.raspberrypi.org


4. Koble til nettet og installer følgende på raspberry pi, instrukser nedenfor, husk å være kritisk og tenk over 
	hvor du laster ned pakkene for at dem skal fungere.

	https://www.npmjs.com/ “Node packet manager” 	For å installere og kontrollere pakker
	
	https://www.nginx.com/ 				For å nettsiden
	
	https://nodejs.org/en/ 				For server og nettverksapplikasjoner
	
	https://fail2ban.org/wiki/index.php/Main_Page 	For sikkerhet
	
	https://socket.io/ 				for websocket kommunikasjon

	Skriv følgende i terminalen på Raspberry Pi:
	
	sudo apt-get install npm
	
	npm i file-system 
	
	npm i express
	
	npm install socket.io@2.3.0		
					
	sudo apt-get install nodejs
	
	sudo apt-get install nginx
	
	sudo apt-get install fail2ban
	
	***NB / OBS***: Dersom tilhørende tjenerkode skal fungere må du bruke versjon 2.3.0
	eller tidligere versjon, ellers må du endre alle funksjoner 
						
	fra: 	function kvadrering(parameter) {parameter*parameter};
						
	til: 	kvadrering = parameter => parameter*parameter;



4. Lag en lokal HTML website som du "hoster" fra raspberry pien, av “default” for våre installasjoner skal HTML filen din hete "index" og plasseres i /var/www/html,
	her kan du også lage scripts og legge til css styleringen din. Bilder kan du også legge til her, bare husk å hent dem med “src = dinfil.js“. 
	Dersom du ønsker å bruke en annen mappe må du belage deg på å gjøre endringer i NGINX configuration.

5. Finn IP-addressen til Raspberry Pi-en din ved å skrive “ifconfig” i terminalen, eller finn 
	tilkoblede enheter på nettverket ditt gjennom ruteren din. Skriv denne addressen inn i nettleseren 
	på en enhet som også er tilkoblet det samme nettverket. 


6. Koble opp ESP32, husk å installere og importer følgende libraries:
	analogwrite.h
	WiFi.H
	WiFiMulti.h
	SocketIoClient.h
 

7. Koble opp klienter (ESP32 og nettside)
	Skriv inn riktig IP addresse for serveren i både Socket.js og tilhørende kode til ESP32
	Husk å endre nettverkskonfigurasjonen i ESP32 koden.



### Nå som du har en fungerende nettside kan du gå videre med å koble den opp mot firebase.
 
8. Lag deg en bruker på https://firebase.google.com/, skriv "npm i firebase-admin" i RPI terminalen for å installere nødvendig programvare (HUSK Å VÆRE I RIKTIG MAPPE).
	Inkluder firebase admin sdk i mappen til serveren din, adminsdk henter du fra Firebase sine sider. 
	Implementer registrering for sikkerhets skyld. Du skal lagre brukere og passord i databasen din, 
	 og når en klient prøver å koble seg til serveren må klienten sende brukernavn og passord til serveren
	 som da skal sjekke mot databasen om brukernavn og passord stemmer før klienten får tilgang. 


### Nå er du klar til siste steg, å ha en globalt tilgjengelig server og nettside.

10. Åpne porter på ruteren (80 for HTTP, og 2520 for node.js tjeneren), og send datatrafikk til IP-addressen til Raspberry Pi-en din,
	Videre skal du endre IP-addressen i Socket.js og ESP32-koden, fra Raspberry Pi-en din sin lokale ip-addresse
	til ruteren din sin globale IP-addresse, denne finner du ved å gå inn på ruter instillinger eller bare google "whats my ip".

11. OPTIONAL: Gå til f.eks. www.noip.com og skaff deg et gratis domene slik at du slipper å huske IP-addressen din. 
	vi gikk med ielet2001g25.ddns.net
	
	Dersom du anskaffer deg et gratis domene må du belage deg på gratis reklame av DNS-provideren din, og at domene ditt må være aktivt i bruk. 
	Dersom domene ditt er inaktivt i 30 dager, mister du det. 
	Om ønskelig kan du også betale for et domene, men da anbefales oppsett av Dynamic DNS, da oppdateres IP-addressen tilhørende domenet
 	 automatisk om IP-addressen din skulle endre seg. 
	


### Filplassering:

Legg index.html og style.css i var/www/html

Legg scripts: socket.js, script.js, chartpoeration.js, tabs.js i var/www/html/script

Legg bibliotekene: Chart.min.js, socket.io.js og socket.io.js.map i var/www/html/libraries

Legg inn register mappa i var/www/html

