const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const swaggerUi = require('swagger-ui-express');

const path = require('path');
const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy (needed for correct rate-limiting / secure cookies behind a reverse proxy)
app.set('trust proxy', 1);

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(hpp()); // prevents HTTP parameter pollution
app.use(xssClean()); // sanitizes user input against XSS
app.use(requestLogger);

// --- Rate limiting (applied to all API routes) ---
app.use(env.apiPrefix, apiLimiter);

// --- Static file serving for uploaded animal photos ---
app.use('/uploads', express.static(path.join(process.cwd(), env.upload.dir)));

// --- API docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.use(env.apiPrefix, routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Heat Cattle Management API',
      docs: '/api-docs',
      health: `${env.apiPrefix}/health`,
    },
  });
});

// --- Error handling (must be last) ---
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
