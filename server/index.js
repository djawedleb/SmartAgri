const express = require("express");
const bodyParser = require("body-parser");
const { type } = require("jquery");
const { default: mongoose } = require("mongoose");
const moongoose = require("mongoose");
//Cross-Origin Resource Sharing (CORS) is a browser-level security feature that disallows the requests (by default) to be made between different origins
//a frontend client(page) requesting a backend server that is deployed on a different origin or domain. we require cors to allow this
const cors = require('cors');

const app = express();
app.use(bodyParser.json()); //so we are able to read data from the react app.js//

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
    