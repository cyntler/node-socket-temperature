const http = require('http');
const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { formatDate, randomInteger } = require('./index-utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8000;
const points = ['Suszarnia 1', 'Suszarnia 2', 'Suszarnia 3', 'Suszarnia 4'];
const minTemperature = -10;
const maxTemperature = 50;
const warningTemperature = 40;
const refreshIntervalSec = 5;
const viewData = {
  points,
  warningTemperature,
  refreshIntervalSec,
};

let refreshInterval;

mongoose
  .connect('mongodb://localhost:27017/temperatures')
  .then(() => {
    const TemperaturesLog = mongoose.model('TemperaturesLog', {
      data: 'Object',
    });

    const calculateTemperatures = () => {
      const data = {
        date: formatDate(new Date()),
        temperatures: points.map((point) => {
          const temperatureValue = randomInteger(
            minTemperature,
            maxTemperature
          );

          return {
            point,
            value: temperatureValue,
            valueColor:
              temperatureValue >= 30
                ? 'green'
                : temperatureValue >= 10
                ? '#F6BE00'
                : 'blue',
          };
        }),
      };

      const temperaturesLog = new TemperaturesLog({
        data,
      });

      temperaturesLog.save();
      return data;
    };

    app.set('view engine', 'hbs');
    app.engine(
      'hbs',
      engine({
        defaultLayout: 'default',
        extname: '.hbs',
      })
    );

    app.use(express.static('public'));

    app.get('/', (_req, res) => {
      res.render('index', viewData);
    });

    app.get('/archive', (_req, res) => {
      TemperaturesLog.find().then((archiveData) => {
        res.render('archive', {
          ...viewData,
          archiveData: archiveData
            .map((data) => data.data)
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        });
      });
    });

    app.use((_, res) => {
      res.type('text/plain');
      res.status(404);
      res.send('404 - Not Found');
    });

    app.use((err, _, res) => {
      console.error(err.message);
      res.type('text/plain');
      res.status(500);
      res.send('500 - Server Error');
    });

    io.on('connection', (socket) => {
      clearTimeout(refreshInterval);

      refreshInterval = setInterval(() => {
        io.emit('data', calculateTemperatures());
      }, refreshIntervalSec * 1000);

      socket.on('disconnect', () => {
        clearTimeout(refreshInterval);
      });
    });

    server.listen(port, () =>
      console.log(`Temperatures app listening on http://localhost:${port}`)
    );
  })
  .catch((err) => console.error('MongoDB failed to connect.', err));
