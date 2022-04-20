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
const res = require('express/lib/response');

// const connection = mysql.createConnection('mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(path.join(__dirname, 'public')));
// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

app.use('/api/greeting', (request, response) => {
  const name = request.query ? request.query.name : undefined;
  response.send({ content: `Hola, ${name || 'World!'}` });
});

// TCP/IP Server: 10.2.111.27
// Port: 3306
// User: root
// Password: ROOT
// Database: sgc

app.use('/api/getEventos', (request, response) => {
  const host = request.query ? request.query.host : undefined;
  const user = request.query ? request.query.user : undefined;
  const password = request.query ? request.query.password : undefined;
  const db = request.query ? request.query.db : undefined;

  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: db,
    connectTimeout: 10000
  });

  connection.connect(error => {
    if (error) {
      console.log(error);
      response.send({ content: `No connection in the db: ${error}` });
    }
    // if (error) throw error;
    console.log('Successfully connected to the database.');
    response.send({ content: 'Successfully connected to the database.' });
  });

  // connection.query('select * from ri505_evento', function (error, results, fields) {
  //   if (error) response.send({ error: error });
  //   // res.json(results);
  //   response.send({ results });
  // });
});

module.exports = app;
