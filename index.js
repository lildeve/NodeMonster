'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;
mongoose.set('useFindAndModify',false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/testing_1',{useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("conexion perfecta");
        
        //Crear el servidor
        app.listen(port, ()  => {
            console.log("el servidor http//localhost:3999 esta funcionando!!");

        });
    })
    .catch(error => console.log(error));