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

// app.post('/api/getServicios', (request, response) => {
//   if (!request.body) return response.sendStatus(400);

//   if (!request.body.credentials) {
//     return response.status(401).json({ error: 'No credentials' });
//   }

//   const { host, user, password, db } = request.body.credentials;

//   const credentials = {
//     host: host,
//     port: 3306,
//     user: user,
//     password: password,
//     database: db,
//     connectTimeout: 10000
//   };

//   try {
//     const validateCredentials = databaseConnection(credentials);
//     if (typeof (validateCredentials) === 'string') return response.status(401).json({ error: validateCredentials });

//     const connection = mysql.createConnection(credentials);
//     connection.connect(error => {
//       if (error) return response.status(401).json({ error: `No connection in the db: ${error}` });
//     });

//     // connection.query('SELECT VERSION();', function (error, results, fields) {
//     connection.query('SELECT serv.id_autotanque, serv.consecutivo2, serv.ts1, serv.volumen, cliente.cuenta, cliente.id_precio, serv.precio_str FROM ri505_servicio serv INNER JOIN cliente ON serv.id_Cliente = cliente.id_Cliente', function (error, results, fields) {
//       if (error) {
//         return response.status(401).json({ error: error });
//       } else {
//         return response.json({ data: results });
//       }
//     });
//   } catch (error) {
//     return response.status(401).send({ response: error });
//   }
// });

app.post('/api/probarConexion', (request, response) => {
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

    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });

    connection.query('SELECT VERSION();', function (error, results) {
      if (error) {
        return response.status(401).json({ error: error });
      } else {
        return response.json({ data: results });
      }
    });
    connection.end();
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
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
  const folio = request.body.folio;
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

    // const date = new Date();
    // Today's date
    // const date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`;

    const conn = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    console.log('Connecting to the db...');
    console.log(`Folio: ${parseInt(folio) + 1} - Folio+100: ${parseInt(folio) + 100}`);

    const query = util.promisify(conn.query).bind(conn);
    const rows = await query('SELECT * FROM ri505_servicio WHERE id_servicio between ? and ?', [parseInt(folio) + 1, parseInt(folio) + 100]);

    conn.end();
    return response.status(201).json({
      status: true,
      message: 'Servicios traidos correctamente.',
      servicios: rows
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncServicios', async (request, response) => {
  const { host, user, password, db } = request.body.credentials;
  // const folio = request.body.folio;
  const oportunidades = request.body.oportunidades;

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

    // const date = new Date();
    // Today's date
    // const date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`;

    const conn = await mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });
    console.log('Connecting to the db...');

    const query = util.promisify(conn.query).bind(conn);

    oportunidades.forEach(async service => {
      // console.log(service);
      service.found = false;
      const rows = await query('SELECT * FROM ri505_servicio WHERE id_Cliente = ? AND num_ruta = ?', [service.id_Cliente, service.num_ruta]);
      if (rows.length !== 0) {
        service.found = true;
        service.folio = rows[0].consecutivo;
        service.ts1 = rows[0].ts1;
        service.volumen = rows[0].volumen;
        service.precio_str = rows[0].precio_str;
      }

      if (oportunidades.indexOf(service) === oportunidades.length - 1) {
        conn.end();
        return response.status(201).json({
          status: true,
          message: 'Servicios traidos correctamente.',
          servicios: oportunidades
        });
      }
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
    return token;
  } catch (e) {
    console.log(e);
  }
};

app.post('/api/web/procesarPeticion', jsonParser, async (request, resp) => {
  const { modulo, accion, paquete } = request.body;
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    SOAPAction: 'http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion'
  };

  const url = 'http://testpotogas.sgcweb.com.mx//ws/1094AEV2/v2/soap.php';
  const token = await getToken();

  if (token === '') return resp.status(401).json({ error: 'No token' });

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
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 });
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
const getTokenCarburacion = async (ip) => {
  // Soap request for token generation
  const url = `http://${ip}/sgcweb//ws/1000/v2/soap.php`;
  const headersTest = {
    'Content-Type': 'text/xml; charset=utf-8',
    // SOAPAction: 'http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/login'
  };
  const username = 'apidisruptt';
  const password = '396782400889b4c00500cf1e268a96a1';
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
    const { response } = await soapRequest({ url: url, headers: headersTest, xml: xml, timeout: 10000 }); // Optional timeout parameter(milliseconds)
    const { body } = response;
    const parser = new DOMParser();
    const responseXML = parser.parseFromString(body, 'text/xml');
    const token = responseXML.getElementsByTagName('id')[0].textContent;
    return token;
  } catch (e) {
    console.log(e);
  }
};

app.post('/api/carburacion/procesarPeticion', jsonParser, async (request, resp) => {
  const { ip, folio, prueba } = request.body;
  if (prueba) {
    const services = [
      {
        servicio_id: '263C51C9-0757-E75A-6505-62E105121921',
        folio: '19488',
        folio_ticket: '16428',
        inicio_servicio: '2022-07-27T14:28:00',
        fin_servicio: '2022-07-27T14:28:31',
        unidad_medida: 'Litro',
        cantidad: '20.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string" ',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '243.2762',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '38.9238',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '282.2000',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '391',
        totalizador_inicial: '98292.9116',
        totalizador_final: '98312.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: 'D51EC3B1-9045-7606-975D-62E10693AE28',
        folio: '19489',
        folio_ticket: '16429',
        inicio_servicio: '2022-07-27T14:31:00',
        fin_servicio: '2022-07-27T14:31:53',
        unidad_medida: 'Litro',
        cantidad: '42.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '510.8799',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '81.7401',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '592.6200',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '392',
        totalizador_inicial: '98312.9116',
        totalizador_final: '98354.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '74CE4DBE-64C8-A62C-B14E-62E10612A1C1',
        folio: '19490',
        folio_ticket: '16430',
        inicio_servicio: '2022-07-27T14:33:00',
        fin_servicio: '2022-07-27T14:34:02',
        unidad_medida: 'Litro',
        cantidad: '43.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '523.0437',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '83.6863',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '606.7300',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '393',
        totalizador_inicial: '98354.9116',
        totalizador_final: '98397.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: 'E2CBA41E-E99E-6424-0DB5-62E10A74006C',
        folio: '19491',
        folio_ticket: '16431',
        inicio_servicio: '2022-07-27T14:48:00',
        fin_servicio: '2022-07-27T14:48:58',
        unidad_medida: 'Litro',
        cantidad: '18.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '218.9485',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '35.0315',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '253.9800',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '394',
        totalizador_inicial: '98397.9116',
        totalizador_final: '98415.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '432121AD-C6A8-3983-6D84-62E10C097489',
        folio: '19492',
        folio_ticket: '16432',
        inicio_servicio: '2022-07-27T14:58:00',
        fin_servicio: '2022-07-27T14:58:23',
        unidad_medida: 'Litro',
        cantidad: '20.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '243.2762',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '38.9238',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '282.2000',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '395',
        totalizador_inicial: '98415.9116',
        totalizador_final: '98435.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '4A16A17-3706-60E7-7D52-62E115B4259C',
        folio: '19493',
        folio_ticket: '16433',
        inicio_servicio: '2022-07-27T15:36:00',
        fin_servicio: '2022-07-27T15:36:15',
        unidad_medida: 'Litro',
        cantidad: '11.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '133.8019',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '21.4081',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '155.2100',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '396',
        totalizador_inicial: '98435.9116',
        totalizador_final: '98446.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '35AB0AA8-A71A-914E-4345-62E1174A1D04',
        folio: '19494',
        folio_ticket: '16434',
        inicio_servicio: '2022-07-27T15:45:00',
        fin_servicio: '2022-07-27T15:45:53',
        unidad_medida: 'Litro',
        cantidad: '36.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '437.8971',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '70.0629',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '507.9600',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '397',
        totalizador_inicial: '98446.9116',
        totalizador_final: '98482.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '1C2FDEB3-6DAE-829D-4B9E-62E11834A25E',
        folio: '19495',
        folio_ticket: '16435',
        inicio_servicio: '2022-07-27T15:48:00',
        fin_servicio: '2022-07-27T15:48:25',
        unidad_medida: 'Litro',
        cantidad: '18.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '218.9485',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '35.0315',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '253.9800',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '398',
        totalizador_inicial: '98482.9116',
        totalizador_final: '98500.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '6D2EA3B5-6280-BC94-19EB-62E11983B4BC',
        folio: '19496',
        folio_ticket: '16436',
        inicio_servicio: '2022-07-27T15:53:00',
        fin_servicio: '2022-07-27T15:53:17',
        unidad_medida: 'Litro',
        cantidad: '10.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '121.6381',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '19.4619',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '141.1000',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '399',
        totalizador_inicial: '98500.9116',
        totalizador_final: '98510.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '23809D35-AB33-E3BD-6C8D-62E11CD38171',
        folio: '19497',
        folio_ticket: '16437',
        inicio_servicio: '2022-07-27T16:08:00',
        fin_servicio: '2022-07-27T16:08:54',
        unidad_medida: 'Litro',
        cantidad: '55.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '669.0094',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '107.0406',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '776.0500',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '400',
        totalizador_inicial: '98510.9116',
        totalizador_final: '98565.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      },
      {
        servicio_id: '270C482C-AC06-80CA-CCD5-62E11D787D1A',
        folio: '19498',
        folio_ticket: '16438',
        inicio_servicio: '2022-07-27T16:12:00',
        fin_servicio: '2022-07-27T16:12:47',
        unidad_medida: 'Litro',
        cantidad: '35.0000',
        merma: '0',
        producto: 'GLP',
        dispensador: '1',
        cliente: 'Publico en general',
        identificador: 'Publico en general',
        consumidor: 'Publico en general VPG',
        vale_electronico: 'string"',
        vendedor: 'Despachador Usuario',
        odometro: '0.0000',
        valor_unitario: '12.1637',
        subtotal: '425.7333',
        impuesto: 'IVA',
        tasa_impuesto: '16.0000',
        importe_impuesto: '68.1167',
        impuesto_extra: 'IEPS',
        tasa_impuesto_extra: '0.0000',
        importe_impuesto_extra: '0.0000',
        precio_unitario_neto: '14.1100',
        importe_total: '493.8500',
        tipo_registro: 'Venta',
        numero_impresiones: '2',
        folio_dispensador: '401',
        totalizador_inicial: '98565.9116',
        totalizador_final: '98600.9116',
        tipo_pago: 'Contado',
        turno: 'Jefe automático - 12 febrero 07:03',
        estacion: 'CAR00650',
        cliente_id: '1',
        consumidor_id: '1',
        autoconsumo: '0',
        identificador_externo_cliente: '',
        identificador_externo_consumidor: ''
      }
    ];
    return resp.json(services);
  } else {
    const url = `http://${ip}/sgcweb//ws/1000/v2/soap.php`;
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8'
      // SOAPAction: url + '/procesarPeticion'
    };

    const token = await getTokenCarburacion(ip);
    console.log(token);

    if (token === '') return resp.status(401).json({ error: 'No token' });

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
      const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 });
      const { body } = response;
      const parser = new DOMParser();
      const responseXML = parser.parseFromString(body, 'text/xml');
      const items = responseXML.getElementsByTagName('item');

      if (items.length === 0) return resp.status(401).json({ error: 'No hay servicios' });

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
  }
});

module.exports = app;
