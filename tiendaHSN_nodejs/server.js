require('dotenv').config(); //<-----leer fichero .env y cargar las variables de entorno en process.env

//configurar servidor web express...
const express = require('express');
const config_pipeline = require('./config_server_express/config_pipeline'); //<----- en esta variable se almacena la funcion que se exporta en el modulo config_pipeline.js

// Claves Mailjet (desde .env)
const authHeader = "Basic " + Buffer.from(`${process.env.MAILJET_PUBLIC_APIKEY}:${process.env.MAILJET_SECRET_APIKEY}`).toString("base64");


const serverExpress= express();
config_pipeline(serverExpress); //<---- se llama a la funcion que configura el servidor express
//configuracion de la PIPELINE de express (conjunto de modulos que procesan las peticiones http-request de los clientes)

serverExpress.listen(3000,
     (error) => {
    if (error){
        console.log(`Error al iniciar el servidor: ${error}`);
    }
    else
    {
        console.log('Servidor web escuchando en el puerto 3000');
    }

})

console.log(`Estoy importando este valor del paquete express: ${serverExpress}`);