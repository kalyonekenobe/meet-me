const path = require('path')

const folders = {
  views: {
    dirname: '../views',
    filesExtension: 'ejs'
  },
  routes: {
    dirname: '../routes',
    filesExtension: 'js'
  },
  models: {
    dirname: '../models',
    filesExtension: 'js'
  },
  controllers: {
    dirname: '../controllers',
    filesExtension: 'js'
  },
}

const resolver = {}

Object.entries(folders).forEach(([key, value]) => {
  resolver[key] = filename => path.resolve(__dirname, value.dirname, `${filename}.${value.filesExtension}`)
})

resolver.resolveFolderPath = folderName => path.resolve(__dirname, folderName)
resolver.getFileByFilename = filename => path.parse(filename)

module.exports = resolver