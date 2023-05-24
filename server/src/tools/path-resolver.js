const path = require('path')

const resolver = {
  views: (name, extension = 'ejs') => path.resolve(__dirname, '../views', `${name}.${extension}`),
  models: (name, extension = 'js') => path.resolve(__dirname, '../models', `${name}.${extension}`),
  routes: (name, extension = 'js') => path.resolve(__dirname, '../routes', `${name}.${extension}`),
  controllers: (name, extension = 'js') => path.resolve(__dirname, '../controllers', `${name}.${extension}`),
  specificFolder: name => path.resolve(__dirname, name),
  specificFile: name => path.resolve(__dirname, name)
}

module.exports = resolver