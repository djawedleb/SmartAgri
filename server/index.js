const express = require("express");
const bodyParser = require("body-parser");
const { type } = require("jquery");
const { default: mongoose } = require("mongoose");
const moongoose = require("mongoose");
//Cross-Origin Resource Sharing (CORS) is a browser-level security feature that disallows the requests (by default) to be made between different origins
//a frontend client(page) requesting a backend server that is deployed on a different origin or domain. we require cors to allow this
const cors = require('cors');
const https = require("https");

const app = express();
app.use(bodyParser.json()); //so we are able to read data from the react app.js, Handles JSON data Used for API requests
app.use(bodyParser.urlencoded({extended:true})); //Handles form data :
// Used for HTML forms

app.use(cors()); //making the server accessible to any domain that requests a resource from it via a browser//
/* app.use(cors) adds the following headers:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Status Code: 204 
*/

moongoose.connect("mongodb://localhost:27017/SmartAgri" )
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB", err));

const loginSchema = new mongoose.Schema({
    UserName: String,
    Password: String,
  });

  const login = moongoose.model("login", loginSchema);

// to search user
app.post("/exploreUser", async function(req, res){
    try {
        const {UserName, Password} = req.body;
        console.log('Searching for user:', UserName);
        
        const existingUser = await login.findOne({UserName: UserName, Password: Password});
        
        if (existingUser) {
            console.log('User found');
            res.json({ exists: true });
        } else {
            console.log('User not found');
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error searching for user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


//getting the login data then passing it to SmartAgri database//
app.post("/explore", function(req, res){
    console.log(req.body);
    const typeditem = req.body;
      const Newitem = new login({
          UserName : typeditem.UserName, 
          Password : typeditem.Password,
      })
        Newitem.save(); //saving it to the DB//
        console.log("item saved successfully");
    });

      // to test in postman
      /*
         {
          "UserName": "testuser",
          "Password": "testpassword"
         }
      */

 app.listen(8080, function() {
    console.log("Server started on port 8080");
  });
    

//API connection with weather forcasts

app.post("/weather",function(req,res){

      //weather app api//
      const city = "constantine";
      const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=941d39e27b50a5c115efd835a2377e1a&units=metric";
      //Makes an HTTP GET request to the OpenWeatherMap API, url2 is the API endpoint URL 
      // Takes a callback function that runs when the request is made
      https.get(url,function(response){
          console.log(response.statusCode);
   
          //to make the data from the weather app in json readable format//
          //This is an event listener for the "data" event ,the API sends data in chunks, and this listens for each chunk
          //Takes a callback function that processes the received data
          response.on("data",function(data){
              const weatherData= JSON.parse(data);
              console.log(weatherData);
   
              res.json({
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                iconUrl: "http://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png",
                city: city,
                humidity: weatherData.main.humidity,
                windspeed: weatherData.wind.speed,
                clouds: weatherData.clouds.all,
            });
          })
      })
})

//Daily 5 days API//
app.post("/weatherDaily",function(req,res){

const url2 = "https://api.openweathermap.org/data/2.5/forecast?lat=40.7143&lon=-74.006&appid=941d39e27b50a5c115efd835a2377e1a&units=metric";
let dataChunks = [];

https.get(url2, function(response) {

    console.log("daily weather status" + response.statusCode);
    
    response.on("data", function(chunk) {
      dataChunks.push(chunk);  //Collecting all data chunks, needed this because i got an error in how data is getting received 
    });
    
    response.on("end", function() {  

        const completeData = Buffer.concat(dataChunks).toString();  // Combine them into a string when the response is complete
        try {
//[Object] and [Array] are Node.js's way of displaying nested objects in the console. To see the actual data, use JSON.stringify()       
            const weatherData2 = JSON.parse(completeData);
            const dailyData = JSON.stringify(weatherData2, null, 2); //just to be able to see data in console
            // console.log("Complete weather data:", dailyData);

            console.log("Complete weather data:", weatherData2.list[0].main);
            console.log("Complete weather data:", weatherData2.list[0].weather);
            console.log("Complete weather data:", weatherData2.list[0].clouds);
            console.log("Complete weather data:", weatherData2.list[0].wind);

        } catch (error) {
            console.error("Error parsing JSON:", error);
        }    

    }); 

});
   
}) 
