const express = require("express");
const bodyParser = require("body-parser");
const { type } = require("jquery");
const { default: mongoose } = require("mongoose");
//Cross-Origin Resource Sharing (CORS) is a browser-level security feature that disallows the requests (by default) to be made between different origins
//a frontend client(page) requesting a backend server that is deployed on a different origin or domain. we require cors to allow this
const cors = require('cors');
const https = require("https");
const multer = require('multer'); // to handle image uploads
//const tf = require('@tensorflow/tfjs-node'); //to load a pre-trained model and make predictions
//const sharp = require('sharp'); //to resize and optimize images
const path = require('path'); //to handle file paths
const fs = require('fs'); //to handle file operations

const app = express();
app.use(bodyParser.json()); //so we are able to read data from the react app.js, Handles JSON data Used for API requests
app.use(bodyParser.urlencoded({extended:true})); //Handles form data :
// Used for HTML forms

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

app.use(cors()); //making the server accessible to any domain that requests a resource from it via a browser//
/* app.use(cors) adds the following headers:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Status Code: 204 
*/

mongoose.connect("mongodb://localhost:27017/SmartAgri" )
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB", err));

const loginSchema = new mongoose.Schema({
    UserName: String,
    Password: String,
  });

  const login = mongoose.model("login", loginSchema);

  const AddUserSchema = new mongoose.Schema({
    UserName: String,
    email: String,
    Password: String,
    Role: String
  });
  
  const User = mongoose.model("User", AddUserSchema);

  
  const AddPlant = new mongoose.Schema({
    Name: String,
    Greenhouse: String,
    Image: String,
  });
  
  const Plant = mongoose.model("Plant", AddPlant);

  const AddGreenhouse = new mongoose.Schema({
    Name: String,
    Location: String,
    Image: String,
  });
  
  const Greenhouse = mongoose.model("Greenhouse", AddGreenhouse);

// to search the user and allow him to login, from the explore page handlesubmit function//
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


// the endpoint to add a new user from ManageUsers handlesubmit function//
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

     
     // Endpoint to update a user from ManageUsers handleSubmit function
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


  // the endpoint to add a new plant from PlantHealth handlesubmit function//
  app.post("/AddPlant", upload.single('image'), async function(req, res){
    try {
      console.log('Received plant data:', req.body);
      console.log('Received file:', req.file);
      
      const AddedPlant = req.body;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      
      const NewPlant = new Plant({
        Name: AddedPlant.name,
        Greenhouse: AddedPlant.greenhouse,
        Image: imagePath
      });
      
      const savedPlant = await NewPlant.save();
      console.log('Plant saved successfully:', savedPlant);
      res.json({ message: "Plant added successfully", plant: savedPlant });
    } catch (error) {
      console.error('Error adding plant:', error);
      res.status(500).json({ error: 'Failed to add plant' });
    }
  });

  // Endpoint to get all plants from PlantHealth page UseEffect
  app.get("/GetPlants", async (req, res) => {
    try {
      const plants = await Plant.find({});
      console.log('Fetched plants:', plants);
      res.json(plants);
    } catch (error) {
      console.error('Error fetching plants:', error);
      res.status(500).json({ error: 'Failed to fetch plants' });
    }
  });


// Endpoint to delete a plant from PlantHealth handleRemove function
app.post("/DeletePlant", async function(req, res){
  const { id, imagePath } = req.body; 
  console.log('Deleting plant:', id, 'with image:', imagePath);
  
  try {
    // First get the plant to ensure it exists and get the image path if not provided
    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    // Delete the plant from database
    const deletedPlant = await Plant.findByIdAndDelete(id);
    
    // Delete the image file if it exists
    const imageToDelete = imagePath || plant.Image;
    if (imageToDelete) {
      const fullPath = path.join(__dirname, imageToDelete);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('Deleted image file:', fullPath);
      }
    }

    res.status(200).json({ message: 'Plant and associated image deleted successfully' });
  } catch (error) {
    console.error("Error deleting plant:", error);
    res.status(500).json({ message: "Error deleting plant", error: error.message });
  }
});

   // Endpoint to update a Plant from PlantHealth handleEdit function
   app.put("/updatePlant/:id", upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, greenhouse } = req.body;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const updateData = {
        Name: name,
        Greenhouse: greenhouse
      };

      if (imagePath) {
        updateData.Image = imagePath;
      }

      const updatedPlant = await Plant.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedPlant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      res.json({ message: "Plant updated successfully", plant: updatedPlant });
    } catch (error) {
      console.error('Error updating plant:', error);
      res.status(500).json({ error: 'Failed to update plant' });
    }
  });

// Endpoint to get all greenhouses
app.get("/GetGreenhouses", async (req, res) => {
  try {
    const greenhouses = await Greenhouse.find({});
    res.json(greenhouses);
  } catch (error) {
    console.error('Error fetching greenhouses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to add a new greenhouse
app.post("/AddGreenhouse", async (req, res) => {
  try {
    const { name, location, image } = req.body;
    const newGreenhouse = new Greenhouse({
      Name: name,
      Location: location,
      Image: image || null
    });
    await newGreenhouse.save();
    res.json({ message: "Greenhouse added successfully", greenhouse: newGreenhouse });
  } catch (error) {
    console.error('Error adding greenhouse:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to update a greenhouse
app.put("/updateGreenhouse/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, image } = req.body;
    const updatedGreenhouse = await Greenhouse.findByIdAndUpdate(
      id,
      { 
        Name: name,
        Location: location,
        Image: image || null
      },
      { new: true }
    );
    if (!updatedGreenhouse) {
      return res.status(404).json({ message: 'Greenhouse not found' });
    }
    res.json({ message: "Greenhouse updated successfully", greenhouse: updatedGreenhouse });
  } catch (error) {
    console.error('Error updating greenhouse:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to delete a greenhouse
app.post("/DeleteGreenhouse", async (req, res) => {
  try {
    const { id } = req.body;
    const deletedGreenhouse = await Greenhouse.findByIdAndDelete(id);
    if (!deletedGreenhouse) {
      return res.status(404).json({ message: 'Greenhouse not found' });
    }
    res.json({ message: 'Greenhouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting greenhouse:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// getting the login data then passing it to SmartAgri database for debugging//
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

// Endpoint to get greenhouse names for dropdown
app.get("/GetGreenhouseNames", async (req, res) => {
  try {
    const greenhouses = await Greenhouse.find({}, 'Name _id');
    res.json(greenhouses);
  } catch (error) {
    console.error('Error fetching greenhouse names:', error);
    res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to get plants by greenhouse ID
app.get("/GetPlantsByGreenhouse/:greenhouseId", async (req, res) => {
  try {
    const { greenhouseId } = req.params;
    const plants = await Plant.find({ Greenhouse: greenhouseId });
    res.json(plants);
  } catch (err) {
    console.error("Error fetching plants:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a single plant by ID
app.get("/GetPlant/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

/*
// Load model once at startup
let model;
const labels = [
  "Tomato___Early_blight",
  "Tomato___Late_blight",
  "Tomato___healthy"
  // Add more labels based on your model
];

async function loadModel() {
  try {
    model = await tf.loadLayersModel('file://model/model.json');
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
}

loadModel();
*/

// Manager PIN verification route
app.post("/verifyManagerPin", async (req, res) => {
  try {
    const { pin } = req.body;
    
    // Replace this with your actual PIN verification logic
    // For security, you should store this PIN securely (e.g., hashed in a database)
    const validPin = "123456"; // This is just an example PIN
    
    if (pin === validPin) {
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error("Error verifying PIN:", error);
    res.status(500).json({ error: "Failed to verify PIN" });
  }
});