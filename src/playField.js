var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10)
var EMPTY_PLAY_FIELD = Immutable.Map({ playField: Immutable.Repeat(EMPTY_ROW, 20), actions: List.of() })
var {currentPiece, next} = require('./nextPiece')

var moveDown = function(playField) {
  var collidesWithBottom = playField.last().some((cell) => cell !== EMPTY_CELL)
  if (collidesWithBottom) {
    return EMPTY_PLAY_FIELD.set("actions", List.of(Immutable.Map({action: "COLLIDED_WITH_BOTTOM", playField })))
  } else {
    return Immutable.Map({ playField: List.of(EMPTY_ROW).concat(playField.slice(0, 19)), actions: List.of() })
  }
}

var playerPressedDown = inputStream
  .map((inputs) => inputs.get("down"))
  .toEventStream()
  .skipDuplicates()
  .filter((isPressed) => isPressed)

var newPiece = currentPiece.map((x) => x.get('piece')).toEventStream()
var getLandingSpace = (playField) => playField.slice(0, 2).map((row) => row.slice(3, 7))
var addPieceToLandingSpace = (landingSpace, piece) => landingSpace.map((row, rowIndex) =>
  row.map(function(cell, cellIndex) {
    return piece.get(rowIndex).get(cellIndex) === 0 ? cell : piece.get(rowIndex).get(cellIndex)
  })
)
var setLandingSpace = (playField, landingSpace) =>
  playField.slice(0, 2).map((row, rowIndex) =>
    row.slice(0, 3)
      .concat(row.slice(3, 7).map((cell, cellIndex) => landingSpace.get(rowIndex).get(cellIndex)))
      .concat(row.slice(7))
  ).concat(playField.slice(2, 20))

var addPieceToPlayField = function(playField, piece) {
  var landingSpace = addPieceToLandingSpace(getLandingSpace(playField), piece)
  return Immutable.Map({ playField: setLandingSpace(playField, landingSpace), actions: List.of() })
}

var gravity = Bacon.interval(1000, { action: "MOVE_PIECE_DOWN" })

var actionStream = newPiece.map(function(piece){ return { action: "NEW_PIECE", piece } })
  .merge(playerPressedDown.map(function(){ return { action: "MOVE_PIECE_DOWN" } }))
  .merge(gravity)

var applyAction = function(previousState, a) {
  switch (a.action) {
    case "NEW_PIECE":
      return addPieceToPlayField(previousState.get('playField'), a.piece)
    case "MOVE_PIECE_DOWN":
      return moveDown(previousState.get('playField'))
  }
}
var tick = actionStream.scan(EMPTY_PLAY_FIELD, applyAction)

var freezeStream = tick.flatMap((t) =>
  Bacon.fromArray(t.get('actions').filter((a) => a.get('action') === "COLLIDED_WITH_BOTTOM").map((a) => a.get('playField')).toArray())
)

freezeStream.onValue(next)

module.exports = {
  playFieldStream: tick.map((x) => x.get('playField')),
  freezeStream
}