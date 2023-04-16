const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");
const { unsafeStringify } = require("stringify");

// Importing the models
const Movies = Models.Movie;
const Users = Models.User;
//const Universe = Models.Universe;
//const Directors = Models.Director;

const app = express();

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect("mongodb://127.0.0.1:27017/my_movie_api")
  .catch((error) => handleError(error));

//CREATE
app.post("/users", (req, res) => {
  Users.findOne({
    username: req.body.username,
  }) /* checking to see if the username already exists by querying the Users model */
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + "already exists");
      } else {
        Users.create({
          /* if user doesn't exist then Users.create mongoose' CREATE command is used to create the new user */
          name: req.body.name,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          }) /* call back sending a response back to the client with the status code and the document "user", letting them know the transaction is completed */
          .catch((error) => {
            /* error handling */
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get all users
app.get("/users", (req, res) => {
  Users.find() /* Querying users model and grabbing all data from users collection */
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get information about a specific user by username
app.get("/users/:Username", (req, res) => {
  Users.findOne({ username: req.params.Username })
    .then((users) => {
      /* sending the response with user data back to the client */
      res.json(users);
    })
    .catch((err) => {
      /* error handling */
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// CREATE - Allow users to add a movie to their list of favorites
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  const promise = Users.findOneAndUpdate(
    { username: req.params.Username },
    {
      $push: {
        favouriteMovies: req.params.MovieID,
      },
    },
    { new: true }
  ).exec();

  promise.then((updatedUser) => {
    res.json(updatedUser);
  });
});

// UPDATE User info
app.put("/users/:Username", (req, res) => {
  const promise = Users.findOneAndUpdate(
    { username: req.params.Username },
    {
      $set: {
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday,
      },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .exec();

  promise.then((updatedUser) => {
    res.json(updatedUser);
  });
});

// DELETE - Allow users to remove a movie from their list of favorites
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  const promise = Users.findOneAndUpdate(
    { username: req.params.Username },
    {
      $pull: {
        favouriteMovies: req.params.MovieID,
      } /* using $pull to remove movieID from favorite movies array. */,
    },
    { new: true }
  ) /* makes sure updated data is returned */
    .exec();

  promise.then((updatedUser) => {
    res.json(updatedUser);
  });
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  const promise = Users.findOneAndRemove({
    username: req.params.Username,
  }).exec();

  promise.then((user) => {
    /* checking if the document exists, if it does it gets deleted, if not it responds with was not found */
    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  });
});

// READ - Get list of all movies
app.get("/movies", (req, res) => {
  Movies.find() /* Querying movies model and grabbing all data from movies collection */
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
// Find movie by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      /* error handling */
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Find movie by universe
app.get("/movies/universe/:Universe", (req, res) => {
  Movies.findOne({ "universe.name": req.params.Universe })
    .then((movies) => {
      res.json(movies.universe);
    })
    .catch((err) => {
      /* error handling */
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Find data about director by name
app.get("/movies/director/:DirectorName", (req, res) => {
  Movies.findOne({ "director.name": req.params.DirectorName })
    .then((movies) => {
      res.json(movies.director);
    })
    .catch((err) => {
      /* error handling */
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//GET request
app.get("/", (req, res) => {
  res.send("Welcome to the superheroe universe!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: _dirname });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
