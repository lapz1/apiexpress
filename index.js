//Modules
const express = require('express');
const nocache = require('nocache')
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const config = require('./config');

//Inicializer
const app = express();

//Variables
let users = [];
let accessLogStream = fs.createWriteStream('./files/access.log', { flags: 'a' })

//middlewares
const logs  = (req, res, next) => {
	let linea = req.path + "\r\n";
	fs.appendFile('./files/logs.txt', linea, (err) => {
		if(err){
			res
			.status(500)
			.send("Error en escritura de Archivo");
		}
		next();
	});
}

const auth = (req, res, next) => {
	let token = req.header("token");
	var decode;	
	try{
		decode = jwt.verify(token, config.tokenKey);
	}catch(ex){
		decode = false;
	}
	
	if(!!decode){
		next();
	} else {
		res
		.status(500)
		.send('Usuario no autorizado');	
	}	
}

//Config
app.use(logs);
app.use(nocache())
app.use(bodyParser.json())
//Usar el middelware en todas las peticiones
app.use(morgan('combined', { stream: accessLogStream }))

//Funciones
function cargarUsuarios(){
	fs.readFile('./files/users.json','utf8', (err, data) => {
		if(err){
			console.log("Error en lectura de Archivo");
		}
		users = JSON.parse(data);
	});
}

//Routes
// Ruta Raiz
app.get('/', (req, res)=>{
    res.send('Hola Mundo!');
});

//Ruta Users Get
app.get('/users', auth, (req, res)=>{
	var ul = "<ul>"
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		ul += "<li>El id: " + obj.id + " pertenece al usuario " + obj.username + "</li>";
	}
	ul += "</ul>";
	
	res
    .status(200)
    .send(ul);
});

//Ruta POST Users
app.post('/users', (req, res)=>{
	const plainPassword = req.body.password;
	const salt = bcrypt.genSaltSync(config.saltRounds);
	const hash = bcrypt.hashSync(plainPassword, salt);
	
    let user = {
		id: req.body.id,
		username: req.body.username,
		password: hash
	};
	users.push(user);		
	
    res
    .status(200)
    .send('El usuario: ' + user.username + ', fue creado con el id: ' + user.id);
});

//Ruta POST Users
app.post('/users/login', (req, res)=>{
	let user = {
		username: req.body.username,
		password: req.body.password
	};
	
    let sw = false;
	let token = '';
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		if(user.username == obj.username && bcrypt.compareSync(user.password, obj.password)){
			token = jwt.sign({username: user.username}, config.tokenKey);
			sw = true;
			break;
		}	
	}	
	
	if(sw){
		res
		.status(200)
		.send('El usuario: ' + req.body.username + ', fue asignado con el token: ' + token);			
	}else{
		res
		.status(500)
		.send('El usuario: ' + req.body.username + ' no pudo iniciar sesión');	
	}	
});

//Ruta PUT Users
app.put('/users', (req, res)=>{
    let id = req.query.id;
	let username = req.query.username;
	let sw = false;
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		if(obj.id == id){
			obj.username = username;
			sw = true;
			break;
		}		
	}	
	
    res
    .status(sw ? 200 : 500)
    .send('El id: ' + id + (sw ? ', fue actualizado' : ', no fue encontrado'));
});

//Ruta DELETE Users
app.delete('/users', (req, res)=>{
    let id = req.query.id;	
	let sw = false;
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		if(obj.id == id){
			users.splice(i, 1);
			sw = true;
			break;
		}		
	}
	
    res
    .status(sw ? 200 : 500)
    .send('El id: ' + id + (sw ? ', fue eliminado' : ', no fue encontrado'));
});

//Server
app.listen(config.port, ()=> {
    console.log('Servidor Iniciado');
	cargarUsuarios();
});