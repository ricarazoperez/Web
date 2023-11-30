"use strict"

const config = require("./public/js/config");
const path = require("path"); 
const mysql = require("mysql"); 
const express = require("express"); 
const bodyParser = require("body-parser"); 
const fs = require("fs");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const utils = require("./public/js/utils"); 
const multer = require ("multer");
const DAOUsers = require("./DAO/DAOUsers");
const DAOAvisos = require("./DAO/DAOAvisos");
const moment= require("moment");

// Crear un servidor Express.js 
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));


const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

app.use(bodyParser.urlencoded({extended: false}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "./profile_imgs"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const multerFactory = multer({storage : storage});

//Obtencion clase MySQLStore
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host     : config.mysqlConfig.host,
    user     : config.mysqlConfig.user,
    password : config.mysqlConfig.password,
    database : config.mysqlConfig.database
});


const middlewareSession = session({
    saveUninitialized: false,
    secret: "hola",
    resave: false,
    store : sessionStore
});
app.use(middlewareSession);

//Middleware Control de acceso
function middlewareControlAcceso(request, response, next){

    if(!request.session.currentUser){
        response.redirect("/login");
    }else{
        response.locals.idUsuario = request.session.idUser;
        response.locals.esTecnico = request.session.esTecnico;
        response.locals.userEmail = request.session.currentUser;
        response.locals.nombre    = request.session.nombre;
        response.locals.perfil    = request.session.perfil;
        response.locals.fecha     = request.session.fecha;
        next();
    }
}

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig); 

const DaoU = new DAOUsers(pool);
const DaoA = new DAOAvisos(pool);

app.get("/", function(request, response){
    response.redirect("/login");
});

//-------------------MANEJADOR DEL MAIN (PARA PAGINA PRINCIPAL) -------------------

app.get("/main", middlewareControlAcceso, function(request, response){
    if(!response.locals.esTecnico) response.redirect("/misAvisos");
    else response.redirect("/avisosEntrantes");
});

//-------------------MANEJADORES LOGIN-------------------
app.get("/login",function(request, response){
    response.status(200);
    response.render("login", {errorMsg : null});
});

app.post("/login",function(request,response){
    
    if(!utils.correoCorrectoUCM(request.body.correo_login) || (!utils.contraseniaValida(request.body.passwd_login))){
        response.status(200);
        response.render("login", {errorMsg : "La direccion de correo tiene que pertenecer a @ucm.es y formato contraseña no validos"});
    }else{
        DaoU.isUserCorrect(request.body.correo_login, request.body.passwd_login, function(err, correcto, usuario){
            if (err){   //ERROR DE ACCESO A BD
                response.status(500);
                console.log(err.message);
            } 
            else if (correcto){
                if(!usuario.activo) response.render("login", {errorMsg : "El usuario no está activo"});
                else{ 
                    request.session.currentUser = request.body.correo_login;
                    request.session.nombre = usuario.nombre;
                    request.session.perfil = usuario.perfil;
                    request.session.idUser = usuario.idUser;
                    request.session.fecha  = usuario.fecha;
                    if (usuario.numEmp !== null) request.session.esTecnico = true;
                    else request.session.esTecnico = false;
                    response.redirect("/main");
                }
            }else{
                response.status(200);
                response.render("login", {errorMsg : "La direccion de correo tiene que pertenecer a @ucm.es y formato contraseña no validos"});
            }
        });
    }
});



//-------------------MANEJADORES LOG OUT-------------------
app.get("/logout", function(request, response){
    request.session.destroy();
    response.redirect("/login");
});

//-------------------MANEJADOR COGER IMAGEN USUARIO-------------------
app.get("/imagenUsuario", middlewareControlAcceso, function(request, response){

    DaoU.getUserImageName(response.locals.userEmail, function(err, nombreImg){
        if(err){
            response.status(500);
            console.log(err); 
        }else{
            response.status(200);
            let ruta = path.join(__dirname, "./profile_imgs" , nombreImg);
            console.log(ruta);
            response.sendFile(ruta);
        }
    });

});

//-------------------MANEJADORES REGISTRO-------------------
app.get("/registro", function(request, response){
    response.status(200);
    response.render("registro", {errorMsg : null});
});

app.post("/registro", multerFactory.single('foto_registro') ,function(request, response){

    let msgError = utils.datosEntradaValidos(request.body, request.file);
    if (msgError !== null) response.render("registro", {errorMsg : msgError});
    else{
        let usuario = utils.crearObjetoUsuario(request.body, request.file);
        DaoU.usuarioExistente(usuario.correo, function(err){
            if(err) response.render("registro", {errorMsg : err.message});
            else{
                if(usuario.esTecnico){
                    DaoU.numEmpleadoExistente(usuario.numEmp, function(err){
                        if(err) response.render("registro", {errorMsg : err.message});
                        else{
                            //CREAR USUARIO TECNICO
                            DaoU.createUser(usuario, function(err){
                                if(err) response.render("registro", {errorMsg : err.message});
                                else{
                                    response.redirect("/login");
                                }
                            });  
                        }
                    });
                }else{
                    //CREAR USUARIO NORMAL
                    DaoU.createUser(usuario, function(err){
                        if(err) response.render("registro", {errorMsg : err.message});
                        else{
                            response.redirect("/login");
                        }
                    }); 
                }
                
            }
        });    
    }

});

//-------------------MANEJADORES DE RUTA DE MIS AVISOS -------------------

app.post("/nuevoAviso", middlewareControlAcceso, function(request, response){

    //LLAMAR A DAO USUARIO PARA COGER EL ID USUARIO QUE CREA AVISO
    DaoU.getIdUser(response.locals.userEmail, function(err, idUsuario){
        if(err){
            response.status(500);
            console.log(err); 
        }else{
            let aviso = utils.crearAviso(request.body, idUsuario);
            DaoA.crearAviso(aviso, function(err){
            if(err){
            response.status(500);
            console.log(err); 
            }else{
                response.redirect("/misAvisos");
            }
            });
        }
    });
});

app.get("/misAvisos", middlewareControlAcceso,function(request, response){
    
   
    if(response.locals.esTecnico){
       
        DaoA.getAvisosTecnico(response.locals.userEmail, function(err, avisos){
            if(err){
                response.status(500);
                console.log(err); 
            }else {
                response.render("main", {opcionNav : "mAv", misAvisos : avisos});
            }
        });
    }else{
        DaoA.getAvisosSinResolver(response.locals.userEmail, function(err, avisos){
            if(err){
                response.status(500);
                console.log(err); 
            }else {
                response.render("main", {opcionNav : "mAv", misAvisos : avisos});
            }
        });
    }

});

app.get("/borrar/:avisoId", middlewareControlAcceso, function(request, response){
    
    DaoA.borrarAviso(request.params.avisoId, response.locals.idUsuario, function(err, result){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            response.status(200);
            response.redirect("/misAvisos");
        }
    });
});

app.post("/terminarAviso/:avisoId", middlewareControlAcceso, function(request, response){

    DaoA.terminarAviso(request.params.avisoId, request.body.comentarios_tecnico, function(err){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            response.status(200);
            response.redirect("/misAvisos");
        }
    });
});


//-------------------MANEJADORES DE RUTA DE AVISOS ENTRANTES -------------------

app.get("/avisosEntrantes", middlewareControlAcceso, function(request, response){


    // HAY QUE MANDAR TAMBIEN UNA LISTA CON LOS TECNICOS QUE ESTAN DISPONIBLES PARA LUEGO PODER
    // ASIGNARLES EN LOS AVISOS
    // LA LISTA DE TECNICOS EN EL RENDER LLAMARLA tecnicos

    DaoA.getAvisosEntrantes(function(err, avisosEntrantes){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            DaoU.getTecnicos(function(err, tecnicos){
                if (err){
                     response.status(500);
                     console.log(err.message);
                } else{
                     response.status(200);
                     response.render("main", {opcionNav : "avEnt", misAvisos : avisosEntrantes, tecnicos : tecnicos});
                }
             });
        }
    });



});

app.post("/asignarTecnico/:avisoId", middlewareControlAcceso, function(request, response){
    
    DaoA.asignarTecnico(request.params.avisoId, request.body.tecnico_asignado, function(err){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            response.status(200);
            response.redirect("/avisosEntrantes");
        }
    });
});

app.post("/anularAviso/:avisoId", middlewareControlAcceso, function(request, response){
    let comentsTecnico = "Este aviso ha sido eliminado por el técnico " + response.locals.nombre + "debido a :\n" + request.body.comentarios_tecnico;
    DaoA.anularAviso(request.params.avisoId, response.locals.idUsuario, comentsTecnico, function(err){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            response.status(200);
            response.redirect("/avisosEntrantes");
        }
    });
});

//-------------------MANEJADORES DE RUTA DE HISTORICO AVISOS -------------------
app.get("/historicoAvisos",middlewareControlAcceso, function(request, response){
    if(!response.locals.esTecnico){
        DaoA.getHistoricoUsuario(response.locals.idUsuario,function(err, historico){
            if (err){
                response.status(500);
                console.log(err.message);
            }else{
                response.status(200);
                response.render("main", {opcionNav : "hAv", misAvisos : historico });
            }
        });

    }else{
        DaoA.getHistoricoTecnico(response.locals.idUsuario,function(err,historico){
            if (err){
                response.status(500);
                console.log(err.message);
            }else{
                response.status(200);
                response.render("main", {opcionNav : "hAv" ,misAvisos : historico });
            }
        });
    }
});

//-------------------MANEJADORES DE RUTA DE BUSQUEDA -------------------
app.post("/busqueda/:opcionNav",middlewareControlAcceso,function(request, response){
    //PRIMERO LISTA DE AVISOS EN FUNCION DE OPCION NAV
    let texto = request.body.barra_nav;
    switch(request.params.opcionNav){
        case "mAv":
            if(response.locals.esTecnico){
                DaoA.getAvisosTecnico(response.locals.userEmail, function(err, avisos){
                    if(err){
                        response.status(500);
                        console.log(err); 
                    }else {
                        let avisosCoincidentes = utils.buscarAvisoTexto(avisos,texto);
                        response.render("main", {opcionNav : "mAv", misAvisos : avisosCoincidentes});
                    }
                });
            }else{
                DaoA.getAvisosSinResolver(response.locals.userEmail, function(err, avisos){
                    if(err){
                        response.status(500);
                        console.log(err); 
                    }else {
                        let avisosCoincidentes = utils.buscarAvisoTexto(avisos,texto);
                        response.render("main", {opcionNav : "mAv", misAvisos : avisosCoincidentes});
                    }
                }); 
            }
        break;
        case "avEnt":
            DaoA.getAvisosEntrantes(function(err, avisosEntrantes){
                if (err){
                  response.status(500);
                  console.log(err.message);
                }else{
                    DaoU.getTecnicos(function(err, tecnicos){
                        if (err){
                            response.status(500);
                            console.log(err.message);
                        } else {
                            response.status(200);
                            let avisosCoincidentes = utils.buscarAvisoTexto(avisosEntrantes,texto);
                            response.render("main", {opcionNav : "avEnt", misAvisos : avisosCoincidentes, tecnicos : tecnicos});
                        }
                    });
                }
            });
        break;
        case "hAv":
            if(!response.locals.esTecnico){
                DaoA.getHistoricoUsuario(response.locals.idUsuario,function(err, historico){
                    if (err){
                        response.status(500);
                        console.log(err.message);
                    }else{
                        response.status(200);
                        let avisosCoincidentes = utils.buscarAvisoTexto(historico,texto);
                        response.render("main", {opcionNav : "hAv", misAvisos : avisosCoincidentes });
                    }
                });
        
            }else{
                DaoA.getHistoricoTecnico(response.locals.idUsuario,function(err,historico){
                    if (err){
                        response.status(500);
                        console.log(err.message);
                    }else{
                        response.status(200);
                        let avisosCoincidentes = utils.buscarAvisoTexto(historico,texto);
                        response.render("main", {opcionNav : "hAv" , misAvisos : avisosCoincidentes});
                    }
                });
            }
        break;
        //GESTION DE USUARIOS
        default:
            DaoU.getUsuarios(function(err,listaUsuarios){
                if (err){
                    response.status(500);
                    console.log(err.message);
                }else{
                    response.status(200);
                    let usuariosCoincidentes = utils.buscarUsuarioNombre(listaUsuarios,texto);
                    response.render("main", {opcionNav : "gUs", usuarios : usuariosCoincidentes});
                   
                }  
            });  
            
    }
});

//-------------------MANEJADORES DE RUTA DE GESTION USUARIOS -------------------

app.get("/gestionUsuarios",middlewareControlAcceso,function(request, response){
    
        DaoU.getUsuarios(function(err,listaUsuarios){
            if (err){
                response.status(500);
                console.log(err.message);
            }else{
                response.status(200);
                response.render("main", {opcionNav : "gUs", usuarios : listaUsuarios});
            }  
        }); 
    });

app.get("/borrarUsuario/:idUsuario", middlewareControlAcceso, function(request, response){

    DaoU.borrarUsuario(request.params.idUsuario,function(err){
        if (err){
            response.status(500);
            console.log(err.message);
        }else{
            response.status(200);
            response.redirect("/gestionUsuarios");
        }
    });
});

//-------------------MANEJADORES DE RUTA DE INFO USUARIOS -------------------


/*app.post("/cogerAvisos/:opcionNav",middlewareControlAcceso, function(request, response){
    
    let objetoCuenta;
    if(response.locals.esTecnico){
        
        DaoA.getInfoAvisosTecnico(response.locals.idUsuario, function(err, avisosPerfil){
            if (err){
                response.status(500);
                console.log(err.message);
            }else{
                response.status(200);
                objetoCuenta = utils.contarAvisos(avisosPerfil);
                //response.render("main", {opcionNav : request.params.opcionNav, misAvisos : request.body.avisos, avisosPerfil : objetoCuenta});
            }  
        });
    }
    else{
        DaoA.getInfoAvisosUsuario(response.locals.idUser, function(err, avisosPerfil){
            if (err){
                response.status(500);
                console.log(err.message);
            }else{
                response.status(200);
                objetoCuenta = utils.contarAvisos(avisosPerfil);
                //response.render("main", {opcionNav : request.params.opcionNav,  avisosPerfil : lista});
            }  
        });
    }
    //COGER DE NUEVO LAS LISTAS Y REDIRECCIONAR A MAIN
    switch(request.params.opcionNav){
        case "mAv":
            if(response.locals.esTecnico){
                DaoA.getAvisosTecnico(response.locals.userEmail, function(err, avisos){
                    if(err){
                        response.status(500);
                        console.log(err); 
                    }else {
                        response.render("main", {opcionNav : "mAv", misAvisos : avisos, avisosPerfil : objetoCuenta});
                    }
                });
            }else{
                DaoA.getAvisosSinResolver(response.locals.userEmail, function(err, avisos){
                    if(err){
                        response.status(500);
                        console.log(err); 
                    }else {
                        response.render("main", {opcionNav : "mAv", misAvisos : avisos, avisosPerfil : objetoCuenta});
                    }
                }); 
            }
        break;
        case "avEnt":
            DaoA.getAvisosEntrantes(function(err, avisosEntrantes){
                if (err){
                  response.status(500);
                  console.log(err.message);
                }else{
                    DaoU.getTecnicos(function(err, tecnicos){
                        if (err){
                            response.status(500);
                            console.log(err.message);
                        } else {
                            response.status(200);
                            response.render("main", {opcionNav : "avEnt", misAvisos : avisosEntrantes, tecnicos : tecnicos, avisosPerfil : objetoCuenta});
                        }
                    });
                }
            });
        break;
        case "hAv":
            if(!response.locals.esTecnico){
                DaoA.getHistoricoUsuario(response.locals.idUsuario,function(err, historico){
                    if (err){
                        response.status(500);
                        console.log(err.message);
                    }else{
                        response.status(200);
                        response.render("main", {opcionNav : "hAv", misAvisos : historico, avisosPerfil : objetoCuentas });
                    }
                });
        
            }else{
                DaoA.getHistoricoTecnico(response.locals.idUsuario,function(err,historico){
                    if (err){
                        response.status(500);
                        console.log(err.message);
                    }else{
                        response.status(200);
                        response.render("main", {opcionNav : "hAv" , misAvisos : historico, avisosPerfil : objetoCuenta});
                    }
                });
            }
        break;
        //GESTION DE USUARIOS
        default:
            DaoU.getUsuarios(function(err,listaUsuarios){
                if (err){
                    response.status(500);
                    console.log(err.message);
                }else{
                    response.status(200);
                    response.render("main", {opcionNav : "gUs", usuarios : listaUsuarios, avisosPerfil : objetoCuenta});
                   
                }  
            });  
            
    }

}); */

// Arrancar el servidor
app.listen(config.port, function(err) { 
    if (err) { 
        console.log("ERROR al iniciar el servidor");
    } else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    } 
});