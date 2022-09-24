const mongoose = require('mongoose');

const dbConnection = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

module.exports = dbConnection;
