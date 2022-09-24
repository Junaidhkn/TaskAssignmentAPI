require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const dbConnection = require('./config/dbConnection');

const app = express();
dbConnection();
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/userRoutes.js'));
app.use('/notes', require('./routes/noteRoutes'));

app.all('*', (req, res) => {
	res.status(404);
	if (req.accepts('html')) {
		res.sendFile(path.join(__dirname, 'views', '404.html'));
	} else if (req.accepts('json')) {
		res.json({ error: 'Resource Not found!' });
	} else {
		res.type('txt').send('Resource Not found!');
	}
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
	console.log(err);
	logEvents(
		`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
		'mongoErrLog.log',
	);
});
