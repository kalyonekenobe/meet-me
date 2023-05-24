const mongoose = require('mongoose')

const connectionString = 'mongodb+srv://kalyonekenobe:57FqeDmAnytJYoKT@meetme.ts7z0g0.mongodb.net/meet-me?retryWrites=true&w=majority'

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(res => console.log('Connected to database')).catch(error => console.log(error))

module.exports = mongoose