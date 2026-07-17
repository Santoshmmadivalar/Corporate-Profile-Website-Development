import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to Database
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 mins
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: 'draft-6',
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// Database Connection Check Middleware
app.use('/api', (req, res, next) => {
  const isConnected = require('mongoose').connection.readyState === 1;
  // Let the AI chatbot operate offline, but gate database-driven routes
  if (!req.path.startsWith('/ai/chat') && !req.path.startsWith('/chat') && !isConnected) {
    res.status(503).json({
      success: false,
      message: 'MongoDB database is offline. Please start MongoDB locally or check your MONGODB_URI connection configuration.'
    });
    return;
  }
  next();
});

import swaggerDocument from './swagger.json';

// Swagger Spec endpoint
app.get('/api/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Interactive Swagger UI documentation page
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Outpro.India API Reference Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      <style>
        body { margin: 0; background: #0b0b0f; }
        .swagger-ui { filter: invert(90%) hue-rotate(180deg); }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #5f1ed2; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.use('/api', apiRoutes);


// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
