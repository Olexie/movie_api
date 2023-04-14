const express = require ('express');
const morgan = require ('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { unsafeStringify } = require('stringify');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

let users=[
    {
        id:'1',
        name:'Jane',
        favouriteMovies:[]

    },
    {
        id:'2',
        name:'John',
        favouriteMovies:['Thor', 'Iron Man']
    }


];

let movies =[
    
    {
        title: 'Iron Man',
        director: {
           name: 'Jon Favreau',
           bio:'is an American actor and filmmaker. As an actor',
           birth: 'October 19, 1966'
    },
        releaseUs: 'May 2008',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title: 'The Incredible Hulk',
        director:{
          name:  'Louis Leterrier',
          bio:' is a French film director and producer. Best known for his work in action films',
          birth:'17 June 1973 '
        },
        releaseUs:'June 2008',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }   
     },
    {
        title: 'Iron Man 2',
        director: {
            name: 'Jon Favreau',
            bio:'is an American actor and filmmaker. As an actor',
            birth: 'October 19, 1966'},
        releaseUs: 'May 2010',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title:'Thor',
        director:{
            name:'Kenneth Branagh',
            bio:'is a British actor and filmmaker.',
            birth:'10 December 1960'
        },
        releaseUs:'May 2011',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    }, 
    {
        title:'Captain America: The First Avenger',
        director:{
          name:  'Joe Johnston',
          bio: 'is an American film director, producer, writer, and visual effects artist.',
          birth: 'May 13, 1950'
        },
        releaseUs:'July 2011',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title:'The Avengers',
        director:{
           name: 'Joss Whedon',
           bio:'is an American filmmaker, composer, and comic book writer.',
           birth: 'June 23, 1964'
        },
        releaseUs:'May 2012',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    }, 
    {
        title:'Iron Man 3',
        director:{
            name:'Shane Black',
            bio:'is an American filmmaker and actor ',
            birth:'December 16, 1961'
        },
        releaseUs:'May 2013',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title:'Thor: The Dark World',
        director:{
            name:'Alan Taylor',
            bio:'is an American filmmaker and actor ',
            birth:'October 24, 1958'
        },
        releaseUs:'November 2013',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title: 'Captain America: The Winter Soldier',
        director:{
          name:  'Antony and Joe Russo',
          bio:'collectively known as the Russo brothers (ROO-so), are American directors, producers, and screenwriters. ',
          birth: 'February 3, 1970,July 18, 1971'
        },
        releaseUs:'April 2014',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    },
    {
        title: 'Avengers: Age of Ultron',
        director:{
            name: 'Joss Whedon',
            bio:'is an American filmmaker, composer, and comic book writer.',
            birth: 'June 23, 1964'
         },
        releaseUs:'May 2015',
        universe: {
            name: 'Marvel',
            description: 'The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.'
        }
    }
];


//CREATE
app.post('/users',(req, res)=>{
    const newUser=req.body;

    if (newUser.name){
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else{
        res.status(400).send('Name required')
    }
})

app.put('/users/:id', (req, res)=>{
    const {id} =req.params;
    const updateUser = req.body;

    let user = users.find(users => users.id ==id);

    if(user){
        user.name = updateUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('user not found')
    }
})

app.post('/users/:id/:movieTitle', (req, res)=>{
    const {id, movieTitle} =req.params;

    let user =users.find(users =>users.id==id);

    if(user){
        user.favouriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
    }else{
        res.status(400).send('no user found')
    }
})

app.delete('/users/:id/:movieTitle', (req, res)=>{
    const {id, movieTitle} = req.params;

    let user =users.find(user=>user.id==id);

    if (user){
        user.favouriteMovies=user.favouriteMovies.filter(title =>title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
    }
})

app.delete('/users/:id',(req,res)=>{
    const {id} =req.params;

    let user = users.find(users => users.id == id);

    if (user){
        users = users.filter(users => users.id !== id);
        res.status(200).send(`user ${id} has been removed`);;
    } else{
        res.status(400).send('user not found')
    }
})

//GET request
app.get ('/',(req, res) =>{
    res.send ('Welcome to the superheroe universee!');
});

//app.get('/movies', (req, res) =>{
//  res.json(marvel);
//});

app.get('/documentation', (req, res)=>{
res.sendFile('public/documentation.html', {root: _dirname});
});

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

app.get('/users', (req, res) => {
    res.status(200).json(users);
})

app.get('/movies/:Title', (req, res)=>{
    const{Title}=req.params;
    const movie = movies.find(movies =>movies.title===Title);

    if (movie){
        res.status(200).json(movie);
    } else{
        res.status(400).send('movie not found')
    }
})

app.get('/movies/universe/:universeName',(req, res)=>{
    const {universeName} =req.params;
    const universe = movies.find(movies =>movies.universe.name===universeName).universe;
    if (universe){
        res.status(200).json(universe);
    } else{
        res.status(400).send('not found')
    }
})

app.get('/movies/director/:directorName', (req, res) => {
    const{directorName} =req.params;
    const director =movies.find(movies => movies.director.name===directorName).director;

    if(director){
        res.status(200).json(director);
    }else{
        res.status(400).send('director not found')
    }
})


app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});
