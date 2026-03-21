// this is the entry point of the application, it will start the server and connect to the database

const app = require('./app');  // load app
//const { connectToDatabase } = require('./config/db'); // load database connection function

// connect to database and start the server
(async () => {
    try {
        // connect to the database

        // uncomment to use database connection
        //await connectToDatabase();
        //console.log('Database connected successfully!');

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