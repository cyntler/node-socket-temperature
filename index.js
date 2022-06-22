const http = require('http');
const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8000;
const cities = ['Warszawa', 'Rzeszów', 'Gdańsk', 'Kraków'];
const warningTemperature = 40;

const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
}
  
const formatDate = (date) => {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const calculateTemperatures = () => {
    return {
        date: formatDate(new Date()),
        temperatures: cities.map((city) => ({
            city,
            value: randomInteger(10, 50)
        }))
    }
}

const emitData = () => {
    io.emit('data', calculateTemperatures());
}

app.set('view engine', 'hbs');
app.engine('hbs', engine({
    defaultLayout: 'default',
    extname: '.hbs'
}));

app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.render('index', {
        cities,
        warningTemperature
    });
});

app.use((_, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Not Found')
});

app.use((err, _, res) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
});

io.on('connection', () => {
    emitData();
});

setInterval(() => {
    emitData();
}, 5000);

server.listen(port, () => console.log(`Example app listening on http://localhost:${port} (CTRL + C to exit)`));
