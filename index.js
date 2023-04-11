const express = require ('express');
 const morgan = require ('morgan');
 const fs = require('fs');
 const path = require('path');

const app = express();

app.arguments(morgan('common'));

let marvel =[
    {
        title: 'Iron Man',
        director: 'Jon Favreau',
        releaseUs: ' May 2008'
    },
    {
        title: 'The Incredible Hulk',
        director:'Louis Leterrier',
        releaseUs:'June 2008'
    },
    {
        title: 'Iron Man 2',
        director: 'Jon Favreau',
        releaseUs: 'May 2010'
    },
    {
        title:'Thor',
        director:'Kenneth Branagh',
        releaseUs:'May 2011'
    }, 
    {
        title:'Captain America: The First Avenger',
        director:'Joe Johnston',
        releaseUs:'July 2011'
    },
    {
        title:'The Avengers',
        director:'Joss Whedon',
        releaseUs:'May 2012'
    }, 
    {
        title:'Iron Man 3',
        director:'Shane Black',
        releaseUs:'May 2013'
    },
    {
        title:'Thor: The Dark World',
        director:'Alan Taylor',
        releaseUs:'November 2013'
    },
    {
        title: 'Captain America: The Winter Soldier',
        director:'Antony and Joe Russo',
        releaseUs:'April 2014'
    },
    {
        title: 'Avengers: Age of Ultron',
        director:'Joss Whedon',
        releaseUs:'May 2015'
    }
];

//GEtT request
app.get ('/',(req, res) =>{
    res.send ('Welcome to the superheroe universe!');
});

app.get('/movies', (req, res) =>{
    res.json(marvel);
});

app.get('/documentation', (req, res)=>{
res.sendFile('public/documentation.html', {root: _dirname});
});

app.arguments((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () =>{
    console.log('Your app is listening on port 8080.');
});
