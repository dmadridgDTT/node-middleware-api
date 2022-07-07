'use strict';

/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

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

// TCP/IP Server: 10.2.111.27
// Port: 3306
// User: root
// Password: ROOT
// Database: sgc

app.get('/api/getServicios', (request, response) => {
  const { host, user, password, db } = request.query;

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
    x
    const connection = mysql.createConnection(credentials);
    connection.connect(error => {
      if (error) return response.status(401).json({ error: `No connection in the db: ${error}` });
    });

    // connection.query('SELECT VERSION();', function (error, results, fields) {
    connection.query('SELECT serv.id_autotanque, serv.consecutivo2, serv.ts1, serv.volumen, cliente.cuenta, cliente.id_precio, serv.precio_str FROM ri505_servicio serv INNER JOIN cliente ON serv.id_Cliente = cliente.id_Cliente', function (error, results, fields) {
      if (error) {
        return response.status(401).json({ error: error });
      } else {
        return response.json({ results });
      }
    });
  } catch (error) {
    return response.status(401).send({ response: error });
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
            console.log(error.sqlMessage);
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

    servicios.forEach(servicio => {
      connection.query('SELECT * FROM servicio WHERE id_Cliente = ?', [servicio.id_Cliente], function (error, results, fields) {
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

module.exports = app;
