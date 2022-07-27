/* eslint-disable space-before-function-paren */
'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const soapRequest = require('easy-soap-request');
const { DOMParser } = require('xmldom');
// const fs = require('fs');

const app = express();

const mysql = require('mysql2');
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
    connection.end();

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
    connection.end();
    return response.status(201).json({
      status: 'success',
      message: 'Clientes synced successfully.',
      clientes: clientes.length
    });
  } catch (error) {
    return response.status(401).send({ response: `Error: ${error}` });
  }
});

app.post('/api/syncServicios', async (request, response) => {
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
      if (error) {
        return response.status(401).json({ error: `No connection in the db: ${error}` });
      }
    });

    // const date = new Date();
    // Today's date
    // const date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`;

    const [rows, fields] = await connection.promise().query('SELECT * FROM ri505_servicio limit 1');

    if (rows.length === 0) {
      return response.status(401).json({ error: 'No servicios to sync' });
    }
    connection.end();
    // console.log(servicios);
    return response.status(201).json({
      status: true,
      message: 'Servicios traidos correctamente.',
      servicios: rows
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
    const informacion = JSON.parse(responseXML.getElementsByTagName('informacion')[0].textContent);
    return resp.status(200).json({ codigo, informacion });
  } catch (e) {
    console.log(e);
    return resp.status(401).json({ error: 'Error procesando peticion', message: e });
  }
});

// SGC Carburación
const getTokenCarburacion = async () => {
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
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
      // {
      //   servicio_id: '',
      //   folio: '',
      //   folio_ticket: '',
      //   inicio_servicio: '',
      //   fin_servicio: '',
      //   unidad_medida: '',
      //   cantidad: '',
      //   merma: '',
      //   producto: '',
      //   dispensador: '',
      //   cliente: '',
      //   identificador: '',
      //   consumidor: '',
      //   vale_electronico: '',
      //   vendedor: '',
      //   odometro: '',
      //   valor_unitario: '',
      //   subtotal: '',
      //   impuesto: '',
      //   tasa_impuesto: '',
      //   importe_impuesto: '',
      //   impuesto_extra: '',
      //   tasa_impuesto_extra: '',
      //   importe_impuesto_extra: '',
      //   precio_unitario_neto: '',
      //   importe_total: '',
      //   tipo_registro: '',
      //   numero_impresiones: '',
      //   folio_dispensador: '',
      //   totalizador_inicial: '',
      //   totalizador_final: '',
      //   tipo_pago: '',
      //   turno: '',
      //   estacion: '',
      //   cliente_id: '',
      //   consumidor_id: '',
      //   autoconsumo: '',
      //   identificador_externo_cliente: '',
      //   identificador_externo_consumidor: ''
      // }
    ];
    return resp.json(services);
  } else {
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
          <modulo xsi:type="xsd:string">${folio}</modulo>
       </sgc:procesarPeticion>
    </soapenv:Body>
  </soapenv:Envelope>`;

    try {
      const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 });
      const { body } = response;
      const parser = new DOMParser();
      const responseXML = parser.parseFromString(body, 'text/xml');
      const codigo = responseXML.getElementsByTagName('codigo')[0].textContent;
      const informacion = JSON.parse(responseXML.getElementsByTagName('informacion')[0].textContent);
      return resp.status(200).json({ codigo, informacion });
    } catch (e) {
      console.log(e);
      return resp.status(401).json({ error: 'Error procesando peticion', message: e });
    }
  }
});

module.exports = app;
