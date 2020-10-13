module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://catherinedavis@localhost/tinylunches',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://catherinedavis@localhost/tinylunchestest',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '20s',
  }