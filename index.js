//Modules
const express = require('express');
const nocache = require('nocache')
const bodyParser = require('body-parser');

const config = require('./config');

//Inicializer
const app = express();

//Variables
let users = [];
let tokens = [];

//middlewares
const auth = (req, res, next) => {
	let token = req.header("token");
	let sw = false;
	for(let i = 0; i < tokens.length; i++){
		if(token == tokens[i]){
			sw = true;
			break;
		}
	}
	
	if(sw){
		next();
	} else {
		res
		.status(500)
		.send('Usuario no autorizado');	
	}	
}

//Config
app.use(nocache())
app.use(bodyParser.json())

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
    let user = {
		id: users.length,
		username: req.body.username,
		password: req.body.password
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
	let token = 0;
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		if(user.username == obj.username && user.password == obj.password){
			token = Math.floor(Math.random() * (999 - 100) + 100);
			tokens.push(token);
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

//Ruta Admin
app.get('/admin', (req, res)=>{
    res
    .status(200)
    .send('<h1>ADMIN DASHBOARD</h1>');
});

//Errores
app.get('/admin1', (req, res)=>{
    res
    .status(500)
    .send('<h1>ERROR</h1><h2>P&aacute;gina no disponible.</h2>');
});

//Server
app.listen(config.port, ()=> {
    console.log('Servidor Iniciado');
});