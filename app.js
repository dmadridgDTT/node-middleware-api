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

app.use('/api/testing-connection', (request, response) => {
  let errors = '';
  const connection = mysql.createConnection({
    host: '10.10.10.10',
    user: 'root',
    password: 'root',
    database: 'sgc'
  });

  connection.connect(function (err) {
    // en caso de error
    if (err) {
      errors = err;
      console.log(err.code);
      console.log(err.fatal);
    }
  });

  response.send({ errors });
});

module.exports = app;
