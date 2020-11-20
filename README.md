# Namaste-app
<p>Post-Covid era is the new normal for all people in the world. Meetings, classes, discussions, paper presentation, etc. will be following online mode. So there is a huge requirement for online video conferencing solutions.So my idea is to create a google meet clone using Python Flask, Node JS, SocketIO, HTML, Bootstrap, Javascript, CSS, JQuery, JQuery UI, WebRTC, and PeerJS. The working  of Namaste App, is similar to that of Google Meet.</p>
<p>Note: Android application for Namaste-app is developed using Android Studio. Android users can only launch meeting through this app.</p>


**Build Using:**
* Python-Flask
* SocketIO
* NodeJS
* PeerJS
* HTML
* CSS
* JavaScript
* Jquery
* Bootstrap
* MySQL

## Features
* Video Conferencing Capability
* Real-time chat
* Profanity filtering

## Working
<p>The conference is confined to only the members that present inside corresponding rooms. The room id is generated using UUID module in Python.</p>
<p>When a new user connects to the application, a socket event stating that a new user is connected is emitted by that user and in response to the event, the server emits the same event to all the user in the room(the room in which the new user has joined), and the remaining clients, in response to the socket event adds the user to the participants list and make a self introduction to the new user. Then the new user calls(sends audio or video streams or both) all other existing users in the specified room, and on receiving the call, the existing users answer the call by sending their own streams.We use PeerJS for WebRTC events, and streaming and, Socket-IO for signaling purposes.</p>

<p>Namaste app also have the ability to turn on and off the video/audio streams when required. We use native JavaScript API to access audio and video stream from the client.	
We also offers a real time chat feature using socket programming. Socket programming is done in Flask application. We programmed the application in a way that we do not store the chat history, which means the chats with in a meeting is only available with in it.  We also implemented profanity filter that filters out, unwanted words. Due to implementation of profanity filter, we cannot implement end to end encryption to the real time chat.</p>
<p>We use MySQL database to store the credentials(such as name, phone number, mail id and password) of the registered users. The password is stored in hashed form.</p>

<p>We have added a self signed SSL certificate to make the application secure else the browser does not allow us to give permission for the application to access camera and audio.</p>

## Demo Link
<a href="https://3.84.117.2:3000">View Demo</a>

## APK Download Link
<a href="https://3.84.117.2:3000/download">Click Here to Download APK</a>

## Demo Video
<a href="https://youtu.be/HXpPAQSfSv8">Click here to view the video</a>

## Deployment Video
<a href="https://youtu.be/cgK_SBxJt3o">Click here to view the video</a>

## Usage Guide
* Server side
  * Make sure you use Python 3.x and you have installed NodeJS.
  * Set the present working directory to "**Namaste-app(Server files)**" folder.
  * Install all modules specified in the requirements.txt file using the command “**pip3 install requirements.txt**”.
  * Install all modules specified in the package.json file using the command “**npm install**”.
  * Import the **users.sql** file(in the DB files folder) into the database using PhpMyAdmin.
  * Make changes to the database credentials specified in Python code to connect to the database. The credentials include database name, username, password, host, etc.
  * Start PeerJS server using the command “**node run peer.js**”.
  * Start Python Flask server using the command “**python3 server.py**”.
* Android
  * Extract the zip file in the Android Studio src folder.
  * Open the Extracted folder in Android Studio.
  * Build and debug the application as per need.
  * If you need to connect the application to local server, change the the IP address in the **loadweb** function call and IP address in the **shouldOverrideUrlLoading** function to your server's local IP address.


## Screenshots

**Sample 1**
<img src="http://zateart.com/covidchart/samples/sample1.png" >
<br>
**Sample 2**
<img src="http://zateart.com/covidchart/samples/sample2.png">




