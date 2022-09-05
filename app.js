/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
'use strict';
const util = require('util');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const soapRequest = require('easy-soap-request');
const { DOMParser } = require('xmldom');
// const fs = require('fs');

const app = express();

const mysql = require('mysql');
// const mysql = require('mysql2');
// const res = require('express/lib/response');

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
app.use(bodyParser.urlencoded({ extended: true }));
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

app.post('/api/probarConexion', async (request, response) => {
  console.log('Probando conexion, /api/probarConexion');
  const { host, user, password, db } = request.body;
  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db
  };

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const conn = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    console.log('Connecting to the db...');

    const query = util.promisify(conn.query).bind(conn);
    const rows = await query('SELECT VERSION();');

    conn.end();
    if (rows.length > 0) {
      return response.status(200).json({ result: rows });
    } else {
      return response.status(401).json({ error: 'No rows found' });
    }

    // return response.status(201).json({
    //   status: true,
    //   message: 'Conexión exitosa',
    //   servicios: rows
    // });
    // const connection = mysql.createConnection(credentials);
    // connection.connect(error => {
    //   if (error) {
    //     console.log(`Error en la conexión: ${error}`);
    //     return response.status(401).json({ error: `No connection in the db: ${error}` });
    //   }
    // });
    // console.log('Conexión exitosa');
    // connection.query('SELECT VERSION();', function (error, results) {
    //   console.log('Haciendo query.');
    //   if (error) {
    //     console.log('Error en query.');
    //     return response.status(401).json({ error: error });
    //   } else {
    //     return response.json({ data: results });
    //   }
    // });
    // connection.end();
  } catch (error) {
    return response.status(401).send({ response: `Error try-catch: ${error}` });
  }
});

app.post('/api/syncPrices', (request, response) => {
  if (!request.body) return response.sendStatus(400);

  if (!request.body.credentials) {
    return response.status(401).json({ error: 'No credentials' });
  }

  if (!request.body.precios && request.body.precios.length === 0) {
    return response.status(401).json({ error: 'No precios to sync' });
  }

  const { host, user, password, db } = request.body.credentials;
  const precios = request.body.precios;

  const credentials = {
    host: host,
    port: 3306,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  };

  if (precios.length === 0) return response.status(401).json({ error: 'No precios to sync' });

  try {
    const validateCredentials = databaseConnection(credentials);
    if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

    const conn = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    console.log('Connecting to the db...');
    const query = util.promisify(conn.query).bind(conn);
    let rowsArray = [];
    precios.forEach(async precio => {
      const rows = await query('SELECT * FROM ri505_precio WHERE id_precio = ?', [precio.id_precio]);

      if (rows.length === 0) {
        // Insertar cliente
        const insertPrecio = await query('INSERT INTO ri505_precio SET ?', precio);
        console.log(`Precio ${precio.id_precio} created successfully`);
        // console.log(insertPrecio);
        rowsArray.push({ data: precio, action: 'inserted' });
      } else {
        // Actualizar precio
        const updatePrecio = await query('UPDATE ri505_precio SET ? WHERE id_precio = ?', [precio, precio.id_precio]);
        console.log(`Precio ${precio.id_precio} updated successfully`);
        // console.log(updatePrecio);
        rowsArray.push({ data: precio, action: 'updated' });
      }

      if (precios.indexOf(precio) === precios.length - 1) {
        conn.end();
        return response.status(201).json({
          status: (rowsArray.length === 0) ? 'false' : 'true',
          message: (rowsArray.length === 0) ? 'Errors while syncing precios.' : 'Precios synced successfully.',
          precios: rowsArray,
          errors: []
        });
      }
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncClientes', jsonParser, async (request, response) => {
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

    const conn = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    console.log('Connecting to the db...');
    const query = util.promisify(conn.query).bind(conn);
    let rowsArray = [];
    clientes.forEach(async cliente => {
      const rows = await query('SELECT * FROM cliente WHERE cuenta = ?', [cliente.cuenta]);

      if (rows.length === 0) {
        // Insertar cliente
        const insertCliente = await query('INSERT INTO cliente SET ?', cliente);
        console.log(`Cliente ${cliente.cuenta} created successfully`);
        // console.log(insertCliente);
        rowsArray.push({ data: cliente, action: 'inserted' });
      } else {
        // Actualizar cliente
        const updateCliente = await query('UPDATE cliente SET ? WHERE cuenta = ?', [cliente, cliente.cuenta]);
        console.log(`Cliente ${cliente.cuenta} updated successfully`);
        // console.log(updateCliente);
        rowsArray.push({ data: cliente, action: 'updated' });
      }

      if (clientes.indexOf(cliente) === clientes.length - 1) {
        conn.end();
        return response.status(201).json({
          status: (rowsArray.length === 0) ? 'false' : 'true',
          message: (rowsArray.length === 0) ? 'Errors while syncing clientes.' : 'Clientes synced successfully.',
          clientes: rowsArray,
          errors: []
        });
      }
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/getServicios', async (request, response) => {
  const { host, user, password, db } = request.body.credentials;
  // const folio = request.body.folio;
  const fecha = request.body.fecha;
  // const oportunidades = request.body.oportunidades;

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

    const conn = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    const hora = Date.now();
    const fechaNow = new Date(hora);

    console.log(`Connecting to the db... at ${fechaNow}`);

    const query = util.promisify(conn.query).bind(conn);
    const rows = await query(`SELECT LPAD(cliente.cuenta, 10, "0") AS id_client, cliente.cuenta, cliente.Nombre, ri505_servicio.*, autotanques.no_autotanque FROM ri505_servicio inner join autotanques ON ri505_servicio.id_autotanque = autotanques.id_autotanque inner join cliente ON ri505_servicio.id_Cliente = cliente.id_Cliente where autotanques.no_autotanque = 4802 AND ts1 BETWEEN "${fecha} 00:00:00" and "${fecha} 23:59:59" limit 10;`);
    // const rows = await query('SELECT LPAD(cliente.cuenta, 10, "0") AS id_client, cliente.cuenta, ri505_servicio.*, autotanques.no_autotanque FROM ri505_servicio inner join autotanques ON ri505_servicio.id_autotanque = autotanques.id_autotanque inner join cliente ON ri505_servicio.id_Cliente = cliente.id_Cliente where ri505_servicio.id_autotanque = 19 AND ts1 BETWEEN "2022-08-21 00:00:00" and "2022-08-21 23:59:59"');
    // const rows = await query('SELECT ri505_servicio.*, autotanques.no_autotanque FROM ri505_servicio inner join autotanques ON ri505_servicio.id_autotanque = autotanques.id_autotanque where ri505_servicio.id_autotanque = 19 AND ts1 BETWEEN CONCAT(CURDATE()," 00:00:00") and CONCAT(CURDATE()," 23:59:59")');
    //     SELECT ri505_servicio.*, autotanques.no_autotanque, cliente.cuenta FROM ri505_servicio
    // inner join autotanques ON ri505_servicio.id_autotanque = autotanques.id_autotanque
    // inner join cliente ON ri505_servicio.id_Cliente = cliente.id_Cliente
    // where autotanques.no_autotanque = 108
    // order by ri505_servicio.id_servicio DESC
    // limit 1000;

    // AND ts1 BETWEEN CONCAT(CURDATE(),' 00:00:00') and CONCAT(CURDATE(),' 23:59:59')

    conn.end();
    return response.status(201).json({
      status: true,
      message: 'Servicios traidos correctamente.',
      cantidad: rows.length,
      servicios: rows,
      timestamp: `Script finalizado en ${Date.now() - hora} ms`
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

// SGC Web Ventas Sandbox

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
    const { response } = await soapRequest({ url: url, headers: headersTest, xml: xml }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    return token;
  } catch (e) {
    console.log(e);
  }
};

app.post('/api/web/sb_procesarPeticion', jsonParser, async (request, resp) => {
  const { modulo, accion, paquete } = request.body;
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion'
  };

  const url = 'http://testpotogas.sgcweb.com.mx//ws/1094AEV2/v2/soap.php';
  const token = await getToken();

  if (token === '' || token === undefined) return resp.status(401).json({ error: 'Ha ocurrido un problema al generar el token. Favor de validar.' });

  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com.mx/sgcweb">
  <soapenv:Header/>
  <soapenv:Body>
     <sgc:procesarPeticion soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <session xsi:type="xsd:string">${token}</session>
        <modulo xsi:type="xsd:string">${modulo}</modulo>
        <accion xsi:type="xsd:string">${accion}</accion>
        <paquete xsi:type="xsd:string">${JSON.stringify(paquete)}</paquete>
     </sgc:procesarPeticion>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml });
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const codigo = responseXML.getElementsByTagName('codigo')[0].textContent;
    if (codigo === '0000' || codigo === '1111') {
      const informacion = JSON.parse(responseXML.getElementsByTagName('informacion')[0].textContent);
      return resp.status(200).json({ codigo, informacion });
    } else {
      return resp.status(200).json({ error: 'Error', codigo: codigo });
    }
  } catch (e) {
    console.log(e);
    return resp.status(401).json({ error: 'Error procesando peticion', message: e });
  }
});

// Get production token
const getProductionToken = async () => {
  // Soap request for token generation
  const url = 'http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php';
  const headersTest = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/login'
  };
  const username = 'apiuser';
  const password = 'b53de80ae066f5ccd74892c2417a0f6d';
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
    const { response } = await soapRequest({ url: url, headers: headersTest, xml: xml }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    return token;
  } catch (e) {
    console.log(e);
  }
};

app.post('/api/web/procesarPeticion', jsonParser, async (request, resp) => {
  console.log('/api/web/procesarPeticion');
  const { modulo, accion, paquete } = request.body;
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion'
  };

  const url = 'http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php';
  const token = await getProductionToken();

  if (token === '') return resp.status(401).json({ error: 'Ha ocurrido un problema al generar el token. Favor de validar.' });

  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com.mx/sgcweb">
  <soapenv:Header/>
  <soapenv:Body>
     <sgc:procesarPeticion soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <session xsi:type="xsd:string">${token}</session>
        <modulo xsi:type="xsd:string">${modulo}</modulo>
        <accion xsi:type="xsd:string">${accion}</accion>
        <paquete xsi:type="xsd:string">${JSON.stringify(paquete)}</paquete>
     </sgc:procesarPeticion>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml });
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');

    const codigo = responseXML.getElementsByTagName('codigo')[0].textContent;
    if (codigo === '0000' || codigo === '1111') {
      const informacion = JSON.parse(responseXML.getElementsByTagName('informacion')[0].textContent);
      return resp.status(200).json({ codigo, informacion });
    } else {
      return resp.status(200).json({ error: 'Error', codigo: codigo });
    }
  } catch (e) {
    console.log(e);
    return resp.status(401).json({ error: 'Error procesando peticion', message: e });
  }
});

// SGC Carburación
const getTokenCarburacion = async (ip, username, password) => {
  // Soap request for token generation
  const url = `http://${ip}/sgcweb//ws/1000/v2/soap.php`;
  const headersTest = {
    'Content-Type': 'text/xml; charset=utf-8'
  };
  // const username = 'apiuser';
  // const password = '0679ee585968931468d144c760b26fe9';

  // const username = 'apidisruptt';
  // const password = '396782400889b4c00500cf1e268a96a1';
  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com/sgcweb">
  <soapenv:Header/>
  <soapenv:Body>
     <sgc:login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <user_auth xsi:type="sgc:user_auth">
           <user_name xsi:type="xsd:string">${username}</user_name>
           <password xsi:type="xsd:string">${password}</password>
        </user_auth>
     </sgc:login>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headersTest, xml: xml }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    return token;
  } catch (e) {
    console.log(`Ha ocurrido un error al generar el token: ${e.code}`);
  }
};

app.post('/api/carburacion/procesarPeticion', jsonParser, async (request, resp) => {
  console.log('/api/carburacion/procesarPeticion');
  const { ip, folio, user, password } = request.body;

  const url = `http://${ip}/sgcweb//ws/1000/v2/soap.php`;
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8'
  };

  const token = await getTokenCarburacion(ip, user, password);
  console.log(`El token: ${token}`);

  if (token === '' || token === undefined) return resp.status(401).json({ error: 'Ha ocurrido un problema al generar el token. Favor de validar.' });

  const xml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sgc="http://www.sgcweb.com/sgcweb">
    <soapenv:Header/>
    <soapenv:Body>
    <sgc:obtenerCarburaciones soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <session_id xsi:type="xsd:string">${token}</session_id>
    <ultimofolio xsi:type="xsd:int">${folio}</ultimofolio>
    <parametros xsi:type="xsd:string"></parametros>
    </sgc:obtenerCarburaciones>
    </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml });
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const items = responseXML.getElementsByTagName('item');

    if (items.length === 0) return resp.status(401).json({ error: 'No hay servicios' });

    console.log(`Se encontraron ${items.length} servicios.`);
    let servicios = [];

    for (let i = 0; i < items.length; i++) {
      const servicio_id = items[i].getElementsByTagName('servicio_id')[0].textContent;
      const folio = items[i].getElementsByTagName('folio')[0].textContent;
      const folio_ticket = items[i].getElementsByTagName('folio_ticket')[0].textContent;
      const inicio_servicio = items[i].getElementsByTagName('inicio_servicio')[0].textContent;
      const fin_servicio = items[i].getElementsByTagName('fin_servicio')[0].textContent;
      const unidad_medida = items[i].getElementsByTagName('unidad_medida')[0].textContent;
      const cantidad = items[i].getElementsByTagName('cantidad')[0].textContent;
      const merma = items[i].getElementsByTagName('merma')[0].textContent;
      const producto = items[i].getElementsByTagName('producto')[0].textContent;
      const dispensador = items[i].getElementsByTagName('dispensador')[0].textContent;
      const cliente = items[i].getElementsByTagName('cliente')[0].textContent;
      const identificador = items[i].getElementsByTagName('identificador')[0].textContent;
      const consumidor = items[i].getElementsByTagName('consumidor')[0].textContent;
      const vale_electronico = items[i].getElementsByTagName('vale_electronico')[0].textContent;
      const vendedor = items[i].getElementsByTagName('vendedor')[0].textContent;
      const odometro = items[i].getElementsByTagName('odometro')[0].textContent;
      const valor_unitario = items[i].getElementsByTagName('valor_unitario')[0].textContent;
      const subtotal = items[i].getElementsByTagName('subtotal')[0].textContent;
      const impuesto = items[i].getElementsByTagName('impuesto')[0].textContent;
      const tasa_impuesto = items[i].getElementsByTagName('tasa_impuesto')[0].textContent;
      const importe_impuesto = items[i].getElementsByTagName('importe_impuesto')[0].textContent;
      const impuesto_extra = items[i].getElementsByTagName('impuesto_extra')[0].textContent;
      const tasa_impuesto_extra = items[i].getElementsByTagName('tasa_impuesto_extra')[0].textContent;
      const importe_impuesto_extra = items[i].getElementsByTagName('importe_impuesto_extra')[0].textContent;
      const precio_unitario_neto = items[i].getElementsByTagName('precio_unitario_neto')[0].textContent;
      const importe_total = items[i].getElementsByTagName('importe_total')[0].textContent;
      const tipo_registro = items[i].getElementsByTagName('tipo_registro')[0].textContent;
      const numero_impresiones = items[i].getElementsByTagName('numero_impresiones')[0].textContent;
      const folio_dispensador = items[i].getElementsByTagName('folio_dispensador')[0].textContent;
      const totalizador_inicial = items[i].getElementsByTagName('totalizador_inicial')[0].textContent;
      const totalizador_final = items[i].getElementsByTagName('totalizador_final')[0].textContent;
      const tipo_pago = items[i].getElementsByTagName('tipo_pago')[0].textContent;
      const turno = items[i].getElementsByTagName('turno')[0].textContent;
      const estacion = items[i].getElementsByTagName('estacion')[0].textContent;
      const cliente_id = items[i].getElementsByTagName('cliente_id')[0].textContent;
      const consumidor_id = items[i].getElementsByTagName('consumidor_id')[0].textContent;
      const autoconsumo = items[i].getElementsByTagName('autoconsumo')[0].textContent;
      const identificador_externo_cliente = items[i].getElementsByTagName('identificador_externo_cliente')[0].textContent;
      const identificador_externo_consumidor = items[i].getElementsByTagName('identificador_externo_consumidor')[0].textContent;

      servicios.push({
        servicio_id,
        folio,
        folio_ticket,
        inicio_servicio,
        fin_servicio,
        unidad_medida,
        cantidad,
        merma,
        producto,
        dispensador,
        cliente,
        identificador,
        consumidor,
        vale_electronico,
        vendedor,
        odometro,
        valor_unitario,
        subtotal,
        impuesto,
        tasa_impuesto,
        importe_impuesto,
        impuesto_extra,
        tasa_impuesto_extra,
        importe_impuesto_extra,
        precio_unitario_neto,
        importe_total,
        tipo_registro,
        numero_impresiones,
        folio_dispensador,
        totalizador_inicial,
        totalizador_final,
        tipo_pago,
        turno,
        estacion,
        cliente_id,
        consumidor_id,
        autoconsumo,
        identificador_externo_cliente,
        identificador_externo_consumidor
      });
    }
    return resp.status(200).json({ servicios });
  } catch (e) {
    console.log(e);
    return resp.status(401).json({ error: 'Error procesando peticion', message: e });
  }
  // }
});

module.exports = app;
