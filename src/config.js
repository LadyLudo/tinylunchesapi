module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://catherinedavis@localhost/tinylunches',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://catherinedavis@localhost/tinylunchestest',
    JWT_SECRET: process.env.JWT_SECRET || '1A9EB8E879A4A2ED97BC8904B7BBB16207A626A1B22E76345EC2217AEED4E149',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '20s',
  }