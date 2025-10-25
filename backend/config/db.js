const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The mongoose driver >=4.0.0 sets appropriate defaults; remove deprecated options
        // to avoid warnings. You can add other options here if needed (e.g. serverSelectionTimeoutMS).
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;