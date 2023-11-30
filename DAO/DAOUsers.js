"use strict"; 

class DAOUsers {
    
    constructor(pool) { 
        this.pool = pool;
    }
    
    usuarioExistente(correo, callback){
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("SELECT USU.idUser FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ?",
                [correo],
                function(err, existe){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos"));
                    else if (existe.length !== 0) callback(new Error("Correo ya existente"));
                    else{
                        callback(null);
                    }
                });
            }
        });
    }

    numEmpleadoExistente(numEmp, callback){
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("SELECT USU.numEmp FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.numEmp = ?",
                [numEmp],
                function(err, existe){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos"));
                    else if(existe.length!==0) callback(new Error("Número de empleado ya existente"));
                    else{
                        callback(null);
                    }
                });
            }
        });
    }

    createUser(usuario, callback) {
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("INSERT INTO UCM_AW_CAU_USU_Usuarios (correo,password,nombre,imagen,perfil_universitario,esTecnico,numEmp, activo) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
                [usuario.correo, usuario.passwd, usuario.nombre, usuario.fotoPerfil, usuario.perfil,usuario.esTecnico,usuario.numEmp, usuario.activo],
                function(err, result){
                    connection.release();
                    if(err) callback(new Error("Error al insertar usuario en base de datos" + err.message));
                    else callback(null);
                });
            }
        });
    }  
   

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function(err, connection) { 
            if (err) { 
                callback(new Error("Error de conexion a la base de datos"));
            } 
            else { 
                connection.query("SELECT * FROM  UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ? AND USU.password = ? ",
                [email,password], 
                function(err, rows) {
                    connection.release(); // devolver al pool la conexion
                    if (err) { 
                        callback(new Error("Error de acceso a la base de datos"));
                    } 
                    else {
                        if (rows.length === 0) {
                            callback(null, false, rows); //no esta el usuario con el password proporcionado
                        } 
                        else { 
                            let u ={
                                idUser      : rows[0].idUser,
                                nombre      : rows[0].nombre,
                                perfil      : rows[0].perfil_universitario,
                                numEmp      : rows[0].numEmp,
                                fecha       : rows[0].fecha,
                                activo      : rows[0].activo
                            };
                            callback(null, true, u);
                            
                        }
                    } 
                });
            } 
        });
    }

    getUserImageName(email, callback) {  
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexion a la base de datos"));
            }
            else{
                connection.query("SELECT USU.imagen FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ?",
                [email],
                function(err, rows){
                    connection.release(); // devolver al pool la conexion
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (rows.length == 0){
                            callback(new Error("No existe el usuario"));
                        }
                        else {
                            callback(null, rows[0].imagen);
                        }
                    }
                });
            }
        });
    } 
    
    isTecnico(correo,callback){
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexion a la base de datos"));
            }
            else{
                connection.query("SELECT USU.esTecnico FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ?",
                [correo],
                function(err, rows){
                    connection.release(); // devolver al pool la conexion
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        callback(null, rows[0].esTecnico); 
                    }
                });
            }
        }); 
    }

    getUserPerfil(email, callback) {  
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexion a la base de datos"));
            }
            else{
                connection.query("SELECT USU.perfil_universitario FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ?",
                [email],
                function(err, rows){
                    connection.release(); // devolver al pool la conexion
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (rows.length == 0){
                            callback(new Error("No existe el usuario"));
                        }
                        else {
                            callback(null, rows[0].perfil_universitario);
                        }
                    }
                });
            }
        });
    }
     
    getIdUser(email, callback) {  
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexion a la base de datos"));
            }
            else{
                connection.query("SELECT USU.idUser FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.correo = ?",
                [email],
                function(err, rows){
                    connection.release(); // devolver al pool la conexion
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (rows.length == 0){
                            callback(new Error("No existe el usuario"));
                        }
                        else {
                            callback(null, rows[0].idUser);
                        }
                    }
                });
            }
        });
    } 


    getTecnicos(callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT USU.idUser, USU.nombre FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.esTecnico = ? AND USU.activo = ?",
                [true, true],
                function(err, rows){
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        
                        let tecnicos = [];
                        rows.forEach(function(tecnico){
                            let t ={
                                id     : tecnico.idUser,
                                nombre : tecnico.nombre
                            };
                            tecnicos.push(t);
                        });
                        connection.release();
                        callback(null, tecnicos);
                    }
                });
            }
        }); 
    }
    
    getUsuarios(callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT USU.idUser, USU.fecha, USU.nombre,USU.perfil_universitario FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.activo = ?",
                [true],
                function(err, rows){
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        
                        let usuarios = [];
                        rows.forEach(function(usuario){
                            let u ={
                                fecha     : usuario.fecha,
                                nombre    : usuario.nombre,
                                idUser    : usuario.idUser,
                                esTecnico : false
                            };
                            if(usuario.perfil_universitario===1) u.esTecnico=true;
                            usuarios.push(u);
                        });
                        connection.release();
                        callback(null, usuarios);
                    }
                });
            }
        }); 
    }

    borrarUsuario(idUsuario, callback){
        this.pool.getConnection(function(err, connection){
            
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("UPDATE UCM_AW_CAU_USU_Usuarios SET activo = ? WHERE idUser = ?",
                [false, idUsuario],
                function(err, result){
                    connection.release();
                    if (err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (result.affectedRows == 0) {
                            callback(new Error("No existe el aviso")); //No existe el usuario
                        } 
                        else{
                            callback(null);
                        }
                    }
                });
            };
        });
    }
    
}

module.exports = DAOUsers;