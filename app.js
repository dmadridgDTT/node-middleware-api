/* eslint-disable space-before-function-paren */
'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const soapRequest = require('easy-soap-request');
const { DOMParser } = require('xmldom');
// const fs = require('fs');

const app = express();

const mysql = require('mysql');
// const res = require('express/lib/response');x

// const connection = mysql.createConnection('mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');

function databaseConnection(credentials) {
  if (
    typeof (credentials.host) === 'undefined' || credentials.host === '' ||
    typeof (credentials.user) === 'undefined' || credentials.user === '' ||
    typeof (credentials.database) === 'undefined' || credentials.database === ''
    // || typeof (credentials.password) === 'undefined' || credentials.password === ''
  ) {
    return `No valid credentials: ${JSON.stringify(credentials)}`;
  } else {
    return true;
  }
}

const jsonParser = bodyParser.json();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/', router);
app.use('/', express.static(path.join(__dirname, 'public')));
// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

app.get('/api/greeting', (request, response) => {
  response.status(200).json({ result: 'Hello World!' });
});

// TCP/IP Server: 10.2.111.13
// Port: 3306
// User: root
// Password: ROOT
// Database: sgc

app.post('/api/getServicios', (request, response) => {
  if (!request.body) return response.sendStatus(400);

  if (!request.body.credentials) {
    return response.status(401).json({ error: 'No credentials' });
  }

  const { host, user, password, db } = request.body.credentials;

  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  };

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) return response.status(401).json({ error: `No connection in the db: ${error}` });
    });

    // connection.query('SELECT VERSION();', function (error, results, fields) {
    connection.query('SELECT serv.id_autotanque, serv.consecutivo2, serv.ts1, serv.volumen, cliente.cuenta, cliente.id_precio, serv.precio_str FROM ri505_servicio serv INNER JOIN cliente ON serv.id_Cliente = cliente.id_Cliente', function (error, results, fields) {
      if (error) {
        return response.status(401).json({ error: error });
      } else {
        return response.json({ data: results });
      }
    });
  } catch (error) {
    return response.status(401).send({ response: error });
  }
});

app.get('/api/probarConexion', (request, response) => {
  const { host, user, password, db } = request.body;
  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
  };

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncPrices', (request, response) => {
  const { host, user, password, db } = request.body.credentials;
  const prices = JSON.parse(request.body.prices);

  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  };

  if (prices.length === 0) return response.status(401).json({ error: 'No prices to sync' });

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });

    prices.forEach(price => {
      connection.query(`UPDATE ri505_precio SET precio = ${price.precio} WHERE id_precio = '${price.id_precio}'`, function (error, results, fields) {
        if (error) {
          return response.status(401).json({ error: error });
        }
      });
    });

    return response.status(201).json({
      status: 'success',
      message: 'Prices synced successfully.',
      prices: prices.length
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncClientes', jsonParser, (request, response) => {
  if (!request.body) return response.sendStatus(400);

  if (!request.body.credentials) {
    return response.status(401).json({ error: 'No credentials' });
  }

  if (!request.body.clientes && request.body.clientes.length === 0) {
    return response.status(401).json({ error: 'No clientes to sync' });
  }

  const { host, user, password, db } = request.body.credentials;
  const clientes = request.body.clientes;

  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  };

  if (clientes.length === 0) return response.status(401).json({ error: 'No clientes to sync' });

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });

    clientes.forEach(cliente => {
      connection.query('SELECT * FROM cliente WHERE id_Cliente = ?', [cliente.id_Cliente], function (error, results, fields) {
        if (error) return response.status(401).json({ error: error });
        if (results.length === 0) {
          console.log('Inserting cliente');
          connection.query('INSERT INTO cliente SET ?', cliente, function (error, results, fields) {
            if (error) return response.status(401).json({ error: error.sqlMessage });
          });
        } else {
          console.log('Updating cliente');
          connection.query('UPDATE cliente SET ? WHERE id_Cliente = ?', [cliente, cliente.id_Cliente], function (error, results, fields) {
            if (error) return response.status(401).json({ error: error.sqlMessage });
          });
        }
      });
    });
    return response.status(201).json({
      status: 'success',
      message: 'Clientes synced successfully.',
      clientes: clientes.length
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncServicios', (request, response) => {
  const { host, user, password, db } = request.body.credentials;
  const servicios = JSON.parse(request.body.servicios);

  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  };

  if (servicios.length === 0) return response.status(401).json({ error: 'No servicios to sync' });

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });

    const date = new Date();
    // Today's date
    const date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`;

    servicios.forEach(servicio => {
      connection.query('SELECT * FROM ri505_servicio limit 1', [servicio.id_Cliente], function (error, results, fields) {
        // connection.query('SELECT * FROM servicio WHERE id_Cliente = ?', [servicio.id_Cliente], function (error, results, fields) {
        if (error) return response.status(401).json({ error: error });
        if (results.length === 0) {
          console.log('Inserting servicio');
          connection.query('INSERT INTO servicio SET ?', servicio, function (error, results, fields) {
            if (error) return response.status(401).json({ error: error.sqlMessage });
          });
        } else {
          console.log('Updating servicio');
          connection.query('UPDATE servicio SET ? WHERE id_Cliente = ?', [servicio, servicio.id_Cliente], function (error, results, fields) {
            if (error) return response.status(401).json({ error: error.sqlMessage });
          });
        }
      });
    });
    return response.status(201).json({
      status: 'success',
      message: 'Servicios synced successfully.',
      servicios: servicios.length
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

// SGC Web Ventas

// Get token
const getToken = async () => {
  // Soap request for token generation
  const url = 'http://testpotogas.sgcweb.com.mx//ws/1094AEV2/v2/soap.php';
  const headersTest = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/login'
  };
  const username = 'apiuser';
  const password = 'a5b5e30dc3dcd0f3f5444baaf38448b1';
  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com.mx/sgcweb" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/">
  <soapenv:Header/>
  <soapenv:Body>
     <sgc:login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <user_auth xsi:type="sgc:user_auth">
           <user_name xsi:type="xsd:string">${username}</user_name>
           <password xsi:type="xsd:string">${password}</password>
        </user_auth>
        <application_name xsi:type="xsd:string">?</application_name>
        <name_value_list xsi:type="sgc:name_value_list" SOAP-ENC:arrayType="sgc:name_value[]"/>
     </sgc:login>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headersTest, xml: xml, timeout: 10000 }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    console.log(token);
    return token;
  } catch (e) {
    console.log(e);
  }
};

app.post('/api/web/procesarPeticion', jsonParser, async (request, response) => {
  // const { xml } = request.body.paquete;
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion'
  };

  const url = 'http://testpotogas.sgcweb.com.mx//ws/1094AEV2/v2/soap.php';
  const token = await getToken();

  if (token === '') return response.status(401).json({ error: 'No token' });

  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com.mx/sgcweb">
  <soapenv:Header/>
  <soapenv:Body>
     <sgc:procesarPeticion soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <session xsi:type="xsd:string">${token}</session>
        <modulo xsi:type="xsd:string">Clientes</modulo>
        <accion xsi:type="xsd:string">registrar</accion>
        <paquete xsi:type="xsd:string">{
         "numero_cliente":"",
     "identificador_externo":"0000321672",
     "nombre":"ALEXIS PTG",
     "rfc":"XAXX010101000",
     "calle":"Héctor Hernández",
     "no_exterior":"5639",
     "no_interior":"302",
     "colonia":"AGUA  REAL",
     "localidad":"SAN LUIS POTOSI",
     "referencia":"",
     "ciudad":"SAN LUIS POTOSI",
     "estado":"SAN LUIS POTOSI",
     "codigo_postal":"31135",
     "pais":"MEXICO",
     "telefono1":"3319283746",
     "telefono2":"",
     "activo":"1",
     "email":"antonio_ptg@test.com",
     "saldo":"",
     "politica_venta_id":"PV00001430615"
   }</paquete>
     </sgc:procesarPeticion>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    console.log(token);
    return token;
  } catch (e) {
    console.log(e);
  }
  // return response.status(201).json({
  //   status: 'success',
  //   message: 'Token generated successfully.',
  //   token: token
  // });
});

module.exports = app;
