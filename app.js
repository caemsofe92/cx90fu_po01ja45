var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var routes = require('./routes/index');
var users = require('./routes/users');

var debug = require('debug')('my-application');

var app = express();

var mysql = require('mysql');

function fecha() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var milisec=date.getMilliseconds();

    return  " => Fecha: " + hour + ":" + min + ":" + sec + ":" + milisec + " - " + day + "/" + month + "/" + year;
}

 var pool = mysql.createPool({
     connectionLimit : 100,
     host     : '192.168.2.191',
     user     : 'cristian',
     password : 'cz2015..',
     database : 'pideyapp_db_22022016',
     connectTimeout: 5000,
     debug    :  false
 });

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pideyapp@gmail.com',
        pass: 'carlos1026279145'
    },
    logger: false,
    debug: false
}, {
    from: 'PideYApp <pideyapp@gmail.com>',
});


function SendEmail(name,email,pin) {
    var message = {
        to: '"'+name+'" <'+email+'>',
        subject: 'Pin de restablecimiento de contraseña',
        
    html: '<div style="width: 100%;height:380px;background: #1B998B;text-align: center;"><div style="margin: auto;width: 100%;height:80px;background: #EF476F;"><p style="padding-top: 20px;font-size:35px; text-align: center;color:#fff;">Recuperacion de Contrase&ntilde;a</p></div><div style="padding:20px 40px 0 40px;font-size:25px; text-align: center;color:#fff;"><p>Hola '+name+', por favor ingresa el siguiente pin donde se indica en la aplicacion de PideYapp para poder restablecer tu contrase&ntilde;a.</p></div><div style="position: relative;top:20px;border-radius: 5px; box-shadow: 0 0 10px #000; margin:0 auto; width: 150px;height:50px;background: #2D3047;"><p style="font-size:35px; color:#fff;margin:0 auto;">'+pin+'</p></div></div>',
    };

    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error enviando correo ' + error.message + fecha());
            return;
        }
        else{
            console.log("Correo electronico enviado a "+name+fecha());
        }
    });
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

app.get('/',function(mainreq,mainres){
    console.log("Requerimiento Login: 1026279145 - carlosoto92 "+ fecha()); 
    pool.getConnection(function(err,connection){ 
        if (err) {
           connection.release();
           console.log('Error conectando la base'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL Login_Process("1026279145","carlosoto92")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta Login: " + res[0][0].msg + fecha());
                 mainres.json(res[0][0]);
             }
             else{
                throw err;
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});


app.post('/login_user',function(mainreq,mainres){
    console.log("Requerimiento Login: " + mainreq.body.cedula +" - "+ mainreq.body.password + fecha()); 
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base'+ err + fecha());
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL Login_Process("'+mainreq.body.cedula+'","'+mainreq.body.password+'")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta Pool: "+res[0][0].msg + fecha());
                 mainres.json(res[0][0]);
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base'+ err + fecha());
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});


app.post('/register_update_user',function(mainreq,mainres){
    console.log("Requerimiento Registro: "+mainreq.body.nombres+","+mainreq.body.apellido1+","+mainreq.body.apellido2+","+mainreq.body.cedula+","+mainreq.body.celular+","+mainreq.body.correo+","+mainreq.body.password+","+mainreq.body.repassword+","+mainreq.body.pais+","+mainreq.body.opcion+ fecha());  
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base Registro'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL sp_comerciantes ("'+mainreq.body.nombres+'","'+mainreq.body.apellido1+'","'+mainreq.body.apellido2+'","'+mainreq.body.cedula+'","'+mainreq.body.celular+'","'+mainreq.body.correo+'","'+mainreq.body.password+'","'+mainreq.body.repassword+'","'+mainreq.body.pais+'","'+mainreq.body.opcion+'")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta Registro: "+res[0][0].msg + fecha());
                 mainres.json(res[0][0]);
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base Registro'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});

app.post('/get_providers',function(mainreq,mainres){
    console.log("Requerimiento Proveedores: " + mainreq.body.cedula +" - "+ mainreq.body.opcion + fecha()); 
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base Proveedores'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());
        
        connection.query('CALL sp_proveedores_ACP("'+mainreq.body.cedula+'","'+mainreq.body.opcion+'")',function(err,res){
             connection.release();
             if(!err) {
		var ret = [];
                ret = JSON.stringify(res[0]);
                console.log("Respuesta Proveedores: "+ ret + fecha());
		var obj = JSON.parse(ret);
                var rpta=obj;
                var respuesta={
                items:rpta
                }
                mainres.json(respuesta);         
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base Proveedores'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});

app.post('/repass1',function(mainreq,mainres){
    console.log("Requerimiento RePass1: " + mainreq.body.cedula + fecha()); 
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base RePass1'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL sp_recuperapass ("'+mainreq.body.cedula+'")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta RePass1: "+res[0][0].msg + fecha());
                 mainres.json(res[0][0]);
                 if(res[0][0].msg=="Si"){SendEmail(res[0][0].NOMBRE,res[0][0].correo,res[0][0].pin);}
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base RePass1'+ err + fecha());
           throw err;
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});


app.post('/repass2',function(mainreq,mainres){
    console.log("Requerimiento RePass2: "+mainreq.body.cedula+" - "+mainreq.body.pin+ fecha()); 
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base RePass2'+ err + fecha());
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL sp_validapin("'+mainreq.body.cedula+'","'+mainreq.body.pin+'")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta RePass2: "+res[0][0].msg+" - "+res[0][0].pin + fecha());
                 mainres.json(res[0][0]);
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base RePass2'+ err + fecha());
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});

app.post('/repass3',function(mainreq,mainres){
    console.log("Requerimiento RePass3: " + mainreq.body.cedula +" - "+ mainreq.body.pass1 +" - "+ mainreq.body.pass2 +" - "+ mainreq.body.pin + fecha()); 
    pool.getConnection(function(err,connection){

        if (err) {
           connection.release();
           console.log('Error conectando la base RePass3'+ err + fecha());
           var respuesta={
                msg:"error"
            }
            mainres.json(respuesta);
            return;
         }

         console.log('connected as id ' + connection.threadId + fecha());

        connection.query('CALL sp_cambiapassword("'+mainreq.body.cedula+'","'+mainreq.body.pass1+'","'+mainreq.body.pass2+'","'+mainreq.body.pin+'")',function(err,res){
             connection.release();
             if(!err) {
                 console.log("Respuesta RePass3: "+res[0][0].msg + fecha());
                 mainres.json(res[0][0]);
             }           
         });

        connection.on('error', function(err) {      
           console.log('Error conectando la base RePass3'+ err + fecha());
           var respuesta={
                msg:"error"
            }
           mainres.json(respuesta);
           return;     
        });
    });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




app.set('port', process.env.PORT || 80);

var server = app.listen(app.get('port'), function() {debug('Express server listening on port ' + server.address().port);});

