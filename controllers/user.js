'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


var controller = {

    probando: function(req, res){
        return res.status(200).send({
            message: "Estoy probando , np."
        })

    },

    testeando : function(req, res){
        return res.status(200).send({
            message: "Im just testing , np."
        })

    },
    

    save: function(req, res){
        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los daros 
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(err){
            return res.status(200).send({     
                message: "Faltan datos por enviar"
            });
        }
        if(validate_name && validate_surname && validate_email){
            //Crear objeto de usuario
            var user = new User();
        
            //Asignar valores al objeto usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si el usuario ya existe
            User.findOne({email: user.email.toLowerCase()}, (err,issetUser) => {
                if(err) {
                    return res.status(500).send({
                        message: "Error al comprobar la duplicidad del usuario"
                    });
                }
                if (!issetUser){
                    //Si no existe ,

                    //Cifrar Contraseña
                    bcrypt.hash(params.password, null , null, (err, hash) => {
                        user.password = hash;
        
                        //Guardar nuevo Usuario
                        user.save((err, userStored) => {
                            if(err) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario"
                                });

                            }
                            if(!userStored){
                                return res.status(400).send({
                                    message: "el usuario no se ha guardado ",
                                });
                            }

                            return res.status(200).send({
                                status : 'success',
                                user: userStored
                            });
                        });// close save
                    });//close bcrypt
                }else{
                    return res.status(200).send({
                        message: "El usuario ya esta registrado "
                    });
                }
            });

        }else{
             return res.status(200).send({
                 message: "Validación de los datos incorrecta , revise los datos y pruebe de nuevo."
             });     
        }  
    },

    login : function(req, res){
        
        //Recoger los parametros de la peticion
        var params = req.body;

        try{
            //Validar datos
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(200).send({     
                message: "Faltan datos por enviar"
            });
        }
        if(!validate_email || !validate_password){
            return res.status(200).send({
                message :"Datos incorrectos.."
            })
        }

        //Buscar usuarios que coincidan con email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if(err) {
                return res.status(500).send({
                    message: "Error al intentar identificarse"
                });
            }

            if(!user){
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }

            //si lo encuentra,

            //comprobar contraseña (coincidencia email y password /bcrypt

            bcrypt.compare(params.password, user.password, (err, check) => {
                //Si es correcto,
                if(check){
                    //Generar un toket jwt y devolverlo ( mas tarde)
                    if(params.gettoken){
                        return res.status(200).send({
                           token: jwt.createToken(user),
                        });
                    }else{
                        //Limpiar el objeto
                        user.password = undefined;
                        //Devolvemos los datos
                        return res.status(200).send({
                            status: "succes",
                            message: "Metodo de login",
                            user
                        });
                    }
                    
                }else{
                    return res.status(200).send({
                        message :"Las credenciales no son correctas",
                        user
                    });
                    
                }
            });

        });
        
    },


    update: function (req, res){
        //Recoger datos del usuario
        var params = req.body;

        //Validar los datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(err){
            return res.status(200).send({     
                message: 'Faltan por enviar'
            });
        }

        //eliminar propiedas innecesarias
        delete params.password;
        var userId = req.user.sub;

        //Buscar y actualizar
        User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdated) => {
            if (err){
                return res.status(200).send({
                    status : 'error',
                    message: 'error al actuaizar usuario'
                    
                });
            }
            if (!userUpdated){
                return res.status(200).send({
                    status : 'error',
                    message: 'No se al actuaizar usuario'
                    
                });
            }
            //Devolver respuesta
            return res.status(200).send({     
                message: 'success',
                user : userUpdated
            });

        });        
    }
};



module.exports = controller;