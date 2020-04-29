//Modules
const express = require('express');
const nocache = require('nocache')
const bodyParser = require('body-parser');

const config = require('./config');

//Inicializer
const app = express();

//Variables
let users = [];

//middlewares
const logger1 = (req, res, next) => {
	console.log("Entro en el Logger 1");
	next();
}

const logger2 = (req, res, next) => {
	console.log("Entro en Logger 2");
	next();
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
app.get('/users', logger1, logger2, (req, res)=>{
	var ul = "<ul>"
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		ul += "<li>El id: " + obj.id + " pertenece al usuario " + obj.name + "</li>";
	}
	ul += "</ul>";
	
	res
    .status(200)
    .send(ul);
});

//Ruta POST Users
app.post('/users', (req, res)=>{
    let persona = {
		id: req.body.id,
		name: req.body.name
	};
	
	users.push(persona);		
	
    res
    .status(200)
    .send('El usuario: ' + persona.name + ', fue creado con el id: ' + persona.id);
});

//Ruta PUT Users
app.put('/users', (req, res)=>{
    let id = req.query.id;
	let name = req.query.name;
	let sw = false;
	for(var i=0; i<users.length; i++){
		var obj = users[i];
		if(obj.id == id){
			obj.name = name;
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