// this is the entry point of the application, it will start the server and connect to the database

require('dotenv').config(); // load environment variables from .env

const app = require('./app');  // load app
const prisma = require('./config/db'); // load database connection

// connect to database and start the server
(async () => {
    try {
        // connect to the database

        await prisma.$connect();
        console.log('Connected to the database successfully');

        // server run
        const PORT = process.env.PORT || 3000; // default port - 3000 or from env
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1); // exit with fail
    }
})();