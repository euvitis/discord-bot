const { config } = require('dotenv')

if (process.env.NODE_ENV === 'dev') {
  config()
}