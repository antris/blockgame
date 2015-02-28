var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10).toList()
var EMPTY_GRID = Immutable.Repeat(EMPTY_ROW, 20).toList()
var INITIAL_STATE = Immutable.Map({ environment: EMPTY_GRID, playField: EMPTY_GRID, actions: List.of() })
var {currentPiece, next} = require('./nextPiece')

var foldGrids = (g1, g2) =>
  g1.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
          Math.max(cell, g2.get(rowIndex).get(cellIndex))
      )
  )

var nudgeDown = (playField) => List.of(EMPTY_ROW).concat(playField.slice(0, 19))
var nudgeRight = (playField) => playField.map((row) => List.of(EMPTY_CELL).concat(row.remove(-1)))
var nudgeLeft = (playField) => playField.map((row) => row.slice(1).push(EMPTY_CELL))

var isOverlapping = (g1, g2) =>
  g1.find((row, rowIndex) =>
    row.find((cell, cellIndex) =>
      cell > 0 && g2.get(rowIndex).get(cellIndex) > 0
    )
  ) !== undefined

var collidesWithBottomIfMovesDown = (playField) => playField.last().some((cell) => cell !== EMPTY_CELL)

var canMoveDown = (playField, environment) =>
  !collidesWithBottomIfMovesDown(playField) && !isOverlapping(nudgeDown(playField), environment)


var moveDown = function(state) {
  var playField = state.get('playField')
  var env = state.get('environment')
  if (collidesWithBottomIfMovesDown(playField)) {
    return state
      .set('playField', EMPTY_GRID)
      .set('environment', foldGrids(env, playField))
      .set('actions', List.of("NEXT_PIECE"))
  } else {
    if (canMoveDown(playField, env)) {
      return state.set('playField', nudgeDown(playField))
    } else {
      return state
        .set('playField', EMPTY_GRID)
        .set('environment', foldGrids(state.get('environment'), playField))
        .set('actions', List.of("NEXT_PIECE"))
    }
  }
}

var drop = function(state) {
  var playField = state.get('playField')
  var env = state.get('environment')
  while (canMoveDown(playField, env)) {
    playField = nudgeDown(playField)
  }
  return state.set('playField', playField)
}

var moveLeft = function(state) {
  var playField = state.get('playField')
  var collidesWithWall = playField.map((row) => row.first()).some((cell) => cell !== EMPTY_CELL)
  if (collidesWithWall) {
    return state
  } else {
    return state.set('playField', nudgeLeft(playField))
  }
}
var moveRight = function(state) {
  var playField = state.get('playField')
  var collidesWithWall = playField.map((row) => row.last()).some((cell) => cell !== EMPTY_CELL)
  if (collidesWithWall) {
    return state
  } else {
    return state.set('playField', nudgeRight(playField))
  }
}
var pressedInput = (inputType) =>
  inputStream
    .map((inputs) => inputs.get(inputType))
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

var addPieceToPlayField = function(state, piece) {
  var playField = state.get('playField')
  var landingSpace = addPieceToLandingSpace(getLandingSpace(playField), piece)
  return state.set('playField', setLandingSpace(playField, landingSpace))
}

var removeCompleteLines = function(state) {
  var incompleteLines = state.get('environment').filter((row) => row.some((cell) => cell === 0))
  var newEmptyLines = Immutable.Repeat(EMPTY_ROW, 20 - incompleteLines.size).toList()
  return state.set('environment', newEmptyLines.concat(incompleteLines))
}

var gravity = Bacon.interval(1000, { action: "MOVE_PIECE_DOWN" })

var actionStream = newPiece.map(function(piece){ return { action: "NEW_PIECE", piece } })
  .merge(pressedInput("down").map(function(){ return { action: "MOVE_PIECE_DOWN" } }))
  .merge(pressedInput("left").map(function(){ return { action: "MOVE_PIECE_LEFT" } }))
  .merge(pressedInput("right").map(function(){ return { action: "MOVE_PIECE_RIGHT" } }))
  .merge(pressedInput("up").map(function() { return { action: "DROP_PIECE" } }))
  .merge(pressedInput("z").map(function() { return { action: "ROTATE_PIECE_LEFT" } }))
  .merge(pressedInput("x").map(function() { return { action: "ROTATE_PIECE_RIGHT" } }))
  .merge(gravity)

var applyAction = function(previousState, a) {
  var state = previousState.set('actions', List.of())
  switch (a.action) {
    case "NEW_PIECE":
      return addPieceToPlayField(state, a.piece)
    case "MOVE_PIECE_DOWN":
      return moveDown(state)
    case "MOVE_PIECE_LEFT":
      return moveLeft(state)
    case "MOVE_PIECE_RIGHT":
      return moveRight(state)
    case "DROP_PIECE":
      return drop(state)
    default:
      return state
  }
}

var tick = actionStream.scan(INITIAL_STATE, applyAction).map(removeCompleteLines)

tick.filter((state) => state.get('actions').contains("NEXT_PIECE")).onValue(next)

module.exports = {
  playFieldStream: tick.map((x) => x.get('playField')),
  environmentStream: tick.map((x) => x.get('environment'))
}