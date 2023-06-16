/**
 * @module routers/app
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { unsafeStringify } = require('stringify');

const { check, validationResult } = require('express-validator');

// Importing the models
const Movies = Models.Movie;
const Users = Models.User;

/**
 * Express app
 * @type {object}
 * @const
 * @namespace appRouter
 */
const app = express();

//cors
const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://olexie.github.io',
  'https://alexa-movie-universe.herokuapp.com',
  'https://alexa-movie-universe.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// middleware
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose
  .connect(
    'mongodb+srv://alexa:5c4ODsub$&xsqDRW@mymoviedb.qox06uy.mongodb.net/my_movie_api?retryWrites=true&w=majority'
  )
  .catch((error) => console.log(error));

/**
 * Create a new user
 * @name post/users
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @param {string} email
 * @param {Date} birthday
 * @param {string} password
 * @returns {object} the newly created user
 */
app.post(
  '/users',
  [
    check('username', 'username is required').isLength({ min: 5 }),
    check(
      'username',
      'username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'password is required').not().isEmpty(),
    check('email', 'email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({
      username: req.body.username,
    })
      //checking to see if the username already exists by querying the Users model
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'already exists');
        } else {
          Users.create({
            //  if user doesn't exist then Users.create mongoose' CREATE command is used to create the new user
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            /**  call back sending a response back to the client with the status code and the document "user", letting them know the transaction is completed */
            .catch((error) => {
              /**error handling */
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * Route to get all users
 * @name get/users
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @returns {Array} a list of user objects
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      /**Querying users model and grabbing all data from users collection*/
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a user object
 * @name get/users/:Username
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @returns {object} the user
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.Username })
      .then((users) => {
        /**  sending the response with user data back to the client */
        res.json(users);
      })
      .catch((err) => {
        /**  error handling */
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Add a movie to a users favourite list
 * @name post/users/:Username/movies/:MovieID
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @param {string} MovieID
 * @returns {object} the updated user object
 */
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

/**
 * Update user details
 * @name put/users/:Username
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @param {string} email
 * @param {Date} birthday
 * @param {string} password
 * @returns {object} the newly created user
 */
app.put(
  '/users/:Username',
  [
    check('username', 'username is required').isLength({ min: 5 }),
    check(
      'username',
      'username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'password is required').not().isEmpty(),
    check('email', 'email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    /**check the validation object for errors*/
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    const promise = Users.findOneAndUpdate(
      { username: req.params.Username },
      {
        $set: {
          username: req.body.username,
          name: req.body.name,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }
    ) /** This line makes sure that the updated document is returned*/
      .exec();

    promise.then((updatedUser) => {
      res.json(updatedUser);
    });
  }
);

/**
 * Delete a movie from a users favourite list
 * @name delete/users/:Username/movies/:MovieID
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @param {string} MovieID
 * @returns {object} the updated user object
 */
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const promise = Users.findOneAndUpdate(
      { username: req.params.Username },
      {
        $pull: {
          favouriteMovies: req.params.MovieID,
        }, //using $pull to remove movieID from favorite movies array
      },
      { new: true }
    ) //  makes sure updated data is returned
      .exec();

    promise.then((updatedUser) => {
      res.json(updatedUser);
    });
  }
);

/**
 * Delete a user
 * @name delete/users/:Username
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} username
 * @returns {string} whether the user was deleted or not
 */
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const promise = Users.findOneAndRemove({
      username: req.params.Username,
    }).exec();

    promise.then((user) => {
      /**  checking if the document exists, if it does it gets deleted, if not it responds with was not found*/
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    });
  }
);

/**
 * Get a list of movies
 * @name get/movies
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @returns {Array} the list of movies
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find() // Querying movies model and grabbing all data from movies collection
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a movie by title
 * @name get/movies/:Title
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} Title
 * @returns {object} the movie object
 */
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ title: req.params.Title })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        //  error handling
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a movie by universe
 * @name get/movies/:Universe
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} Universe
 * @returns {object} the movie object
 */
app.get(
  '/movies/universe/:Universe',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'universe.name': req.params.Universe })
      .then((movies) => {
        res.json(movies.universe);
      })
      .catch((err) => {
        // error handling
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a movie by director
 * @name get/movies/:DirectorName
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 * @param {string} DirectorName
 * @returns {object} the movie object
 */
app.get(
  '/movies/director/:DirectorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'director.name': req.params.DirectorName })
      .then((movies) => {
        res.json(movies.director);
      })
      .catch((err) => {
        /** error handling */
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Landing page
 * @name get/
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 */
app.get('/', (req, res) => {
  res.send('Welcome to the superhero universe!');
});

/**
 * Documentation
 * @name get/documentation
 * @function
 * @memberof module:routers/app~appRouter
 * @inner
 */
app.get(
  '/documentation',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.sendFile('./documentation.html', { root: _dirname });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
