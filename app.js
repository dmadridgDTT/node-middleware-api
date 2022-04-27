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
// const res = require('express/lib/response');

// const connection = mysql.createConnection('mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(path.join(__dirname, 'public')));
// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

app.use('/api/greeting', (request, response) => {
  response.status(200).json({ result: 'Hello World!' });
});

// TCP/IP Server: 10.2.111.27
// Port: 3306
// User: root
// Password: ROOT
// Database: sgc

app.use('/api/getEventos', (request, response) => {
  const { host, user, password, db } = request.query;

  // || typeof (password) === 'undefined' || password === ''
  if (typeof (host) === 'undefined' || host === '' || typeof (user) === 'undefined' || user === '' || typeof (db) === 'undefined' || db === '') {
    response.status(503).send({ content: 'No valid credentials.' });
  } else {
    const connection = mysql.createConnection({
      host: host,
      port: 3306,
      user: user,
      password: password,
      database: db,
      connectTimeout: 10000
    });

    connection.connect(error => {
      if (error) {
        response.status(503).send({ content: `No connection in the db: ${error}` });
      } else {
        // console.log('Successfully connected to the database.');
        connection.query('select * from ri505_evento', function (error, results, fields) {
          if (error) response.send({ error: error });
          response.json({ results });
        });
      }
    });
  }
});

module.exports = app;
