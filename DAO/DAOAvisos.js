class DAOAvisos{

    constructor(pool) { 
        this.pool = pool;
    }

    /** 
     * FUNCIONES PARA MIS AVISOS
     */

    getAvisosSinResolver(email, callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.fecha, AVI.observaciones, AVI.tipoAviso, AVI.idTecnicoAsignado,USU.nombre,AVI.comentariosTecnico, USU.perfil_universitario  FROM UCM_AW_CAU_USU_Usuarios USU JOIN UCM_AW_CAU_AVI_Avisos AVI ON USU.idUser = AVI.idUser WHERE USU.correo = ? AND AVI.resuelto = ?",
                [email, false],
                function(err, rows){
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                idAviso        : aviso.idAviso,
                                fecha          : aviso.fecha,
                                texto          : aviso.observaciones,
                                tipo           : aviso.tipoAviso,
                                idTecnico      : aviso.idTecnicoAsignado,
                                perfil         : aviso.perfil_universitario,
                                nombreUsuAviso : aviso.nombre,
                                comentariosTec : aviso.comentariosTecnico
                            };
                            if(a.idTecnico !== null){
                                //Coger el nombre del tecnico
                                connection.query("SELECT USU.nombre FROM UCM_AW_CAU_USU_Usuarios USU WHERE USU.idUser = ?",
                                [a.idTecnico],
                                function(err, rows){
                                    if(err) callback(new Error("Error de acceso a la base de datos"));
                                    else{
                                        a.nombreTecnico = rows[0].nombre;
                                    }
                                });
                            }
                            avisos.push(a);
                        });
                        connection.release();
                        callback(null, avisos); 

                    }
                });
            }
        }); 
    }
    
    /*
    getAvisosTecnico(email, callback){

        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.tipoAviso, AVI.fecha, AVI.observaciones, USU.nombre, AVI.comentariosTecnico, USU.perfil_universitario FROM UCM_AW_CAU_USU_Usuarios USU JOIN UCM_AW_CAU_AVI_Avisos AVI ON USU.idUser = AVI.idTecnicoAsignado WHERE USU.correo = ? AND AVI.resuelto =?",
                [email,false],
                function(err, rows){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos"));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                                fecha              : aviso.fecha,
                                idAviso            : aviso.idAviso,
                                texto              : aviso.observaciones,
                                nombreUsuAviso     : aviso.nombre
                            };
                          
                            connection.query("SELECT USU.nombre, USU.perfil_universitario FROM UCM_AW_CAU_USU_Usuarios USU JOIN UCM_AW_CAU_AVI_Avisos AVI ON USU.idUser = AVI.idUser WHERE idAviso = ?", [aviso.idAviso],
                            function(err,result){
                                a.perfil=result[0].perfil_universitario;
                                a.nombreUsuAviso=result[0].nombre;
                                avisos.push(a);
                            });
                        });
                        callback(null, avisos);
                    }
                });
            }
        }); 
    }*/

    getAvisosTecnico(email, callback){

        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.tipoAviso, AVI.fecha, AVI.observaciones, USU.nombre, AVI.comentariosTecnico, USU.perfil_universitario FROM UCM_AW_CAU_USU_Usuarios USU JOIN UCM_AW_CAU_AVI_Avisos AVI ON USU.idUser = AVI.idTecnicoAsignado WHERE USU.correo = ? AND AVI.resuelto =?",
                [email,false],
                function(err, rows){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos"));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                                fecha              : aviso.fecha,
                                idAviso            : aviso.idAviso,
                                perfil             : aviso.perfil_universitario,
                                texto              : aviso.observaciones,
                                comentariosTecnico : aviso.comentariosTecnico,
                                nombreUsuAviso     : aviso.nombre
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });
            }
        }); 
    }
    
    crearAviso(aviso,callback){

        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("INSERT INTO UCM_AW_CAU_AVI_Avisos (tipoAviso,observaciones,fecha,hora,idUser,categoriaAviso,idTecnicoAsignado,comentariosTecnico,resuelto) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)",
                [aviso.tipoAviso, aviso.observaciones, aviso.fecha, aviso.hora, aviso.idUser,aviso.categoriaAviso,aviso.idTecnicoAsignado, aviso.comentariosTecnico,false],
                function(err, result){
                    connection.release();
                    if(err) callback(new Error("Error al insertar usuario en base de datos" + err.message));
                    else callback(null);
                });
            };
        });
    }
    
    borrarAviso(idAviso, idTecnico ,callback){

        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("UPDATE UCM_AW_CAU_AVI_Avisos SET  resuelto = ? WHERE idAviso = ?",
                [ true, idAviso],
                function(err, result){
                    connection.release();
                    if (err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (result.affectedRows == 0) {
                            callback(new Error("No existe el aviso")); //No existe el aviso
                        } 
                        else{
                            callback(null);
                        }
                    }
                });
            };
        });
    }
    
    terminarAviso(idAviso,comentarios_tecnico,callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("UPDATE UCM_AW_CAU_AVI_Avisos SET  comentariosTecnico = ?, resuelto = ? WHERE idAviso = ?",
                [comentarios_tecnico, true, idAviso],
                function(err, result){
                    connection.release();
                    if (err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (result.affectedRows == 0) {
                            callback(new Error("No existe el aviso")); //No existe el aviso
                        } 
                        else{
                            callback(null);
                        }
                    }
                });
            };
        });
    }
    anularAviso(idAviso,idTecnico,comentarios_tecnico,callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("UPDATE UCM_AW_CAU_AVI_Avisos SET  idTecnicoAsignado= ?, comentariosTecnico = ?, resuelto = ? WHERE idAviso = ?",
                [idTecnico, comentarios_tecnico, true, idAviso],
                function(err, result){
                    connection.release();
                    if (err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (result.affectedRows == 0) {
                            callback(new Error("No existe el aviso")); //No existe el aviso
                        } 
                        else{
                            callback(null);
                        }
                    }
                });
            };
        });
    }

    
    /** 
     * FUNCIONES PARA AVISOS ENTRANTES
     */

    getAvisosEntrantes(callback){
        this.pool.getConnection(function(err, connection){
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.tipoAviso, AVI.fecha, AVI.observaciones, AVI.comentariosTecnico, AVI.idTecnicoAsignado, USU.nombre, USU.perfil_universitario FROM UCM_AW_CAU_AVI_Avisos AVI JOIN UCM_AW_CAU_USU_Usuarios USU ON AVI.idUser = USU.idUser  WHERE AVI.resuelto = ?",
                [false],
                function(err, rows){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                                fecha              : aviso.fecha,
                                idAviso            : aviso.idAviso,
                                perfil             : aviso.perfil_universitario,
                                texto              : aviso.observaciones,
                                comentariosTecnico : aviso.comentariosTecnico,
                                idTecnicoAsignado  : aviso.idTecnicoAsignado,
                                nombreUsuAviso     : aviso.nombre
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });
            }
        });
    }

    asignarTecnico(idAviso, idTecnico, callback){
        this.pool.getConnection(function(err, connection){
            
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("UPDATE UCM_AW_CAU_AVI_Avisos SET  idTecnicoAsignado = ? WHERE idAviso = ?",
                [idTecnico, idAviso],
                function(err, result){
                    connection.release();
                    if (err){
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        if (result.affectedRows == 0) {
                            callback(new Error("No existe el aviso")); //No existe el aviso
                        } 
                        else{
                            callback(null);
                        }
                    }
                });
            };
        });
    }

    getHistoricoTecnico(idTecnico,callback){
        this.pool.getConnection(function(err, connection){
           
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.tipoAviso, AVI.fecha, AVI.observaciones, AVI.comentariosTecnico, USU.nombre, USU.perfil_universitario FROM UCM_AW_CAU_AVI_Avisos AVI JOIN UCM_AW_CAU_USU_Usuarios USU ON AVI.idTecnicoAsignado = USU.idUser  WHERE AVI.resuelto = ? AND AVI.idTecnicoAsignado = ?",
                [true, idTecnico],
                function(err, rows){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                                fecha              : aviso.fecha,
                                idAviso            : aviso.idAviso,
                                perfil             : aviso.perfil_universitario,
                                texto              : aviso.observaciones,
                                comentariosTecnico : aviso.comentariosTecnico,
                                nombreUsuAviso     : aviso.nombre
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });
            }
        });
    }
    getHistoricoUsuario(idUsuario,callback){
        this.pool.getConnection(function(err, connection){
            
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT AVI.idAviso, AVI.tipoAviso, AVI.fecha, AVI.observaciones, AVI.comentariosTecnico, USU.nombre, USU.perfil_universitario FROM UCM_AW_CAU_AVI_Avisos AVI JOIN UCM_AW_CAU_USU_Usuarios USU ON AVI.idUser = USU.idUser  WHERE AVI.resuelto = ? AND USU.idUser = ? ",
                [true,idUsuario],
                function(err, rows){
                    connection.release();
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                                fecha              : aviso.fecha,
                                idAviso            : aviso.idAviso,
                                perfil             : aviso.perfil_universitario,
                                texto              : aviso.observaciones,
                                comentariosTecnico : aviso.comentariosTecnico,
                                nombreUsuAviso     : aviso.nombre
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });



            }
        });
    }

    getInfoAvisosTecnico(idTecnico, callback){
        this.pool.getConnection(function(err, connection){
            
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT tipoAviso FROM UCM_AW_CAU_AVI_Avisos WHERE idTecnicoAsignado = ? AND resuelto =  ?",
                [idTecnico, true],
                function(err, rows){
                    connection.release();
                    console.log(rows);
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });



            }
        });

    }

    getInfoAvisosUsuario(idUsuario, callback){
        this.pool.getConnection(function(err, connection){
            
            if (err) callback(new Error("Error de conexion a la base de datos"));
            else{
                connection.query("SELECT tipoAviso FROM UCM_AW_CAU_AVI_Avisos WHERE idUser = ?",
                [idUsuario],
                function(err, rows){
                    connection.release();
                    console.log(rows);
                    if(err) callback(new Error("Error de acceso a la base de datos" + err.message));
                    else{
                        let avisos = [];
                        rows.forEach(function(aviso){
                            let a ={
                                tipo               : aviso.tipoAviso,
                            };
                            avisos.push(a);
                        });
                        callback(null, avisos);
                    }
                });

            }
        });

    }

}

module.exports = DAOAvisos;