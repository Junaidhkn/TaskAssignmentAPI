const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logFileName) => {
	const logFile = path.join(__dirname, '..', 'logs', logFileName);
	const logMessage = `${format(
		new Date(),
		'yyyy-MM-dd HH:mm:ss',
	)} \t ${message} \t ${uuid()}`;
	try {
		if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
			await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
		}
		await fsPromises.appendFile(logFile, logMessage + '\n');
	} catch (error) {
		console.log(error);
	}
};

const logger = (req, res, next) => {
	logEvents(
		`${req.method} \t ${req.url} \t ${req.headers.origin}`,
		'reqLog.log',
	);
	console.log(`${req.method} \t ${req.path}`);
	next();
};

module.exports = { logger, logEvents };
