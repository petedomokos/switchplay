//todo - pass MONGODB_URI through as an environment variable (ie a setting) in azure app service
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb+srv://peterdomokos:3Millbrook@switchplaycluster.l5lum.mongodb.net/switchplay_db?retryWrites=true&w=majority' ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/playergains'
}

export default config