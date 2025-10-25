const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');

// Load env vars from the backend folder explicitly so running from root still works
dotenv.config({ path: path.join(__dirname, '.env') });

// Basic sanity check for critical env vars
if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment. Please set it in backend/.env or your process env.');
}

// Connect to database and only start the server after a successful connection
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            // Start the automatic processor service after DB is connected
            autoProcessorService.start();
        });
    })
    .catch(err => {
        console.error('Failed to connect to DB, exiting. Details:', err && err.message ? err.message : err);
        process.exit(1);
    });
// Import auto processor service
const autoProcessorService = require('./services/autoProcessorService');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

// Basic Swagger documentation
const swaggerDocs = {
    openapi: '3.0.0',
    info: {
        title: 'Application Tracking System API',
        version: '1.0.0',
        description: 'API documentation for ATS'
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: {
                                        type: 'string',
                                        format: 'email'
                                    },
                                    password: {
                                        type: 'string',
                                        minimum: 6
                                    },
                                    role: {
                                        type: 'string',
                                        enum: ['applicant', 'admin', 'bot']
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Add more endpoint documentation as needed
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Note: server is started after successful DB connection above

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    autoProcessorService.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    autoProcessorService.stop();
    process.exit(0);
});
