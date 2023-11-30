"use strict"

let moment=require("moment");

function correoCorrectoUCM(email){
    return /\S((?<!not)@ucm.es)/s.test(email);
}

function datosEntradaValidos(usuario, foto){

    let msgError = null;
    
    //Comprobar datos de entrada validos
    if (correoCorrectoUCM(usuario.correo_registro)){
        //Contraseña
        let contra = contraseniaValida(usuario.passwd_registro, usuario.conf_passwd_registro)
        if(contra.correcto){
            
            //TECNICO
            if(usuario.perfil_registro === "PAS"){
                if(usuario['checkbox-tecnico'] !== undefined){
                    //comprobar Num empleado
                    if(!numEmpValido(usuario.numEmpleado_registro)){
                        msgError = "Número de empleado inválido";
                        return msgError;
                    }
                }
            }
            //TIENE FOTO 
            //TODO COMPROBAR SI METEMOS OTROS FICHEROS POR EJEMPLO (PDF, ZIP);
            if(foto !== undefined){
                //COMPROBAR FORMATO   
                if(foto.mimetype !== 'image/png' && foto.mimetype !== 'image/jpeg' && foto.mimetype !== 'image/jpg'){
                    msgError = "El formato de foto solo puede ser png, jpg o jpeg"; 
                }       
            }    
        }else{
             msgError = contra.msgError; 
        }
     }else{
         msgError = "Correo inválido, necesita acabar con @ucm.es";
     }
    return msgError;
}


function numEmpValido(numEmp){
    return /\d{4}\-[a-z]{3}/.test(numEmp);
}

//Objeto con booleano correcto y mensajeError
function contraseniaValida(pass1, pass2){

    if (pass1 !== pass2) return {correcto: false, msgError :  "Las contraseñas no coinciden"};
    else{
        if(!formatoContraseniaValido(pass1)) return {correcto: false, msgError :  "El formato de la contraseña es inválido. La contraseña debe tener al entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula, al menos una mayúscula y al menos un caracter no alfanumérico"};
        else{
            return {correcto: true, msgError: ""};
        }
    }
}


function formatoContraseniaValido(passwd){
    return /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/.test(passwd);
}

function crearObjetoUsuario(requestUsuario, requestFile){
    let usuario = {
        correo : requestUsuario.correo_registro,
        passwd : requestUsuario.passwd_registro,
        nombre : requestUsuario.nombre_registro,
        activo : true
    };

    if(requestUsuario.perfil_registro === "A")   usuario.perfil = 0;
    else if(requestUsuario.perfil_registro === "PAS") usuario.perfil = 1;
    else if(requestUsuario.perfil_registro === "PDI") usuario.perfil = 2;
    else   usuario.perfil = 3;

    if(requestUsuario.perfil_registro === "PAS" && requestUsuario['checkbox-tecnico'] !== undefined){
        usuario.esTecnico = true;
        usuario.numEmp = requestUsuario.numEmpleado_registro;
    }else{
        usuario.esTecnico = false;
        usuario.numEmp = null;
    }
    if(requestFile !== undefined){
        usuario.fotoPerfil = requestFile.originalname;
    }else{
        usuario.fotoPerfil = "fotoDefecto.png";   
    }
    return usuario;
}

function crearAviso(requestAviso, idUsuario){
    
    let hoy = moment();
    let f = hoy.format("DD-MM-YYYY");
    let h=hoy.format("H:mm");
    
    let aviso = {
        tipoAviso          : requestAviso.tipo_nuevo_aviso,
        fecha              : f,
        hora               : h,
        idUser             :idUsuario,
        categoriaAviso     : requestAviso.categoria_nuevo_aviso,
        idTecnicoAsignado  : null,
        comentariosTecnico : "",
        observaciones      : requestAviso.observaciones
    };
    
    return aviso;
}

function buscarAvisoTexto(avisos,texto){
    let avisosCoincidentes=[];
    let valido;
    avisos.forEach(aviso => {
       valido= aviso.texto.includes(texto);
       if(valido) avisosCoincidentes.push(aviso);
    });
    return avisosCoincidentes;
}

function buscarUsuarioNombre(usuarios,texto){
    let usuariosCoincidentes=[];
    let valido;
    usuarios.forEach(usuario => {
       valido= usuario.nombre.includes(texto);
       if(valido) usuariosCoincidentes.push(usuario);
    });
    return usuariosCoincidentes;
}

function contarAvisos(avisosPerfil){
    let sugerencias = 0;
    let incidencias = 0;
    let felicitaciones=0;
    let total=0;
    avisosPerfil.forEach(aviso => {
        if(aviso.tipo === 0) sugerencias++;
        else if (aviso.tipo === 1) incidencias++;
        else felicitaciones++;
    });
    
    total = sugerencias + incidencias + felicitaciones;
    return {sugerencias,incidencias,felicitaciones,total};
}

module.exports = {
    correoCorrectoUCM: correoCorrectoUCM,
    contraseniaValida: contraseniaValida,
    datosEntradaValidos: datosEntradaValidos,
    crearObjetoUsuario: crearObjetoUsuario,
    crearAviso: crearAviso,
    buscarAvisoTexto: buscarAvisoTexto,
    buscarUsuarioNombre: buscarUsuarioNombre,
    contarAvisos: contarAvisos
}