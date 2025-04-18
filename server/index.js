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

  const AddUserSchema = new mongoose.Schema({
    UserName: String,
    email: String,
    Password: String,
    Role: String
  });
  
  const User = moongoose.model("User", AddUserSchema);

// to search the user and allow him to login, from the explore page handlesubmit function
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


// the endpoint to add a new user from ManageUsers handlesubmit function
app.post("/AddUser", function(req, res){
    console.log(req.body);
    const AddedUser = req.body;
      const NewUser = new User({
          UserName : AddedUser.username, 
          email : AddedUser.email,
          Password : AddedUser.password,
          Role : AddedUser.role
      })
      NewUser.save(); //saving it to the DB of users//

      const NewLogin = new login({
        _id: NewUser._id, //sharing the id so when we delete a user he can't login once again
        UserName : AddedUser.username, 
        Password : AddedUser.password,
    })
      NewLogin.save(); //saving it to the DB of logins//
      console.log("item saved successfully");
    });


    // Endpoint to get all users from ManageUsers page UseEffect
   app.get("/GetUsers", async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Endpoint to delete a user from ManageUsers handleDelete function
  app.post("/deleteUser", function(req, res){
    const { id } =req.body; 
    console.log(id);
    async function Delete() {
      try {
        const deletedUser = await User.findByIdAndDelete(id); // Delete by ID from Users dataBase
        const deletedLogin = await login.findByIdAndDelete(id); // Delete by ID from logins dataBase
        if (!deletedUser || !deletedLogin) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
      }
    }
       Delete();
    });


 //endpoint to return User data called from ManageUsers account, handleEdit functions
 app.get('/PersonalData/:id', async (req, res) => {
    try {
      const u = await User.findById(req.params.id);
      if (!u) return res.status(404).send('Not found');
      res.json({
        username: u.UserName,
        email:    u.email,
        password: u.Password,
        role:     u.Role
      });
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });

     
     // Endpoint to update a user from ManageUsers handleSumit function
     app.put("/updateUser/:id", async (req, res) => {
        const { id } = req.params;
        const { username, email, password, role } = req.body;
        try {
          const updatedUser = await User.findByIdAndUpdate(
            id,
            { UserName: username, email: email, Password: password, Role: role },
            { new: true }
          );
          await login.findByIdAndUpdate(
            id,
            { UserName: username, Password: password }
          );
          res.json({ message: "User updated", user: updatedUser });
        } catch (err) {
          console.error("Error updating user:", err);
          res.status(500).json({ error: err.message });
        }
      });


//getting the login data then passing it to SmartAgri database for debugging//
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
    

// Weather API endpoint
app.get("/weather", async function(req, res) {
    try {
        const location = req.query.location || "London"; // Default to London if no location provided
        const API_KEY = "279d276787d542e78ae150612250604";
        
        const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`;
        
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process hourly forecast data (next 10 hours)
        const hourlyForecast = data.forecast.forecastday[0].hour
            .filter(hour => {
                const hourTime = new Date(hour.time);
                const currentTime = new Date();
                return hourTime >= currentTime;
            })
            .slice(0, 10)
            .map(item => ({
                time: item.time,
                temp: Math.round(item.temp_c),
                condition: item.condition.code,
                isDay: item.is_day
            }));
        
        res.json({
            temperature: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            windSpeed: Math.round(data.current.wind_kph),
            humidity: data.current.humidity,
            uvIndex: Math.round(data.current.uv),
            maxUvIndex: 10,
            conditionCode: data.current.condition.code,
            isDay: data.current.is_day,
            locationName: data.location.name,
            forecast: hourlyForecast
        });
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            message: error.message
        });
    }
});
