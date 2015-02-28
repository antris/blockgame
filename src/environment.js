var Immutable = require('immutable')
var EMPTY_ROW = Immutable.Repeat(0, 10)
var INITIAL_ENVIRONMENT = Immutable.Repeat(EMPTY_ROW, 20)
var playField = require('./playField')

var freeze = (environment, playField) =>
  environment.map((row, rowIndex) =>
    row.map((cell, cellIndex) =>
      Math.max(cell, playField.get(rowIndex).get(cellIndex))
    )
  )

var environmentStream = playField.freezeStream.scan(INITIAL_ENVIRONMENT, freeze)


module.exports = environmentStream