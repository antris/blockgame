var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List, Map} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10).toList()
var EMPTY_GRID = Immutable.Repeat(EMPTY_ROW, 20).toList()

var toString = function(playField) {
  var s = '';
  playField.forEach(function(row) {
    row.forEach(function(cell) {
      s += cell;
    })
    s += '\n';
  })
  return s
}

var getRandomPiece = () => pieces.asList.get(Math.random() * pieces.asList.size)

var initialStack = Immutable.List.of(
  Map({piece: getRandomPiece(), nth: 0}),
  Map({piece: getRandomPiece(), nth: 1}),
  Map({piece: getRandomPiece(), nth: 2}),
  Map({piece: getRandomPiece(), nth: 3}),
  Map({piece: getRandomPiece(), nth: 4})
)

var currentPieceInGrid = function(state) {
  var putCell = function(grid, coords) {
    var x = coords.get(0)
    var y = coords.get(1)
    if (y < 0) return grid
    return grid.set(y, grid.get(y).set(x, pieces.colors.get(state.get('currentPiece'))))
  }
  var cells = nonEmptyCellCoordinates(state)
  var g = cells
    .filter((coords) => withinBounds(coords.get(0), coords.get(1)))
    .reduce(putCell, EMPTY_GRID)
  return g
}

var now = () => new Date().getTime()

var initialState = Immutable.Map({
  environment: EMPTY_GRID,
  currentPiece: undefined,
  nextPieces: initialStack.slice(1),
  pieceRotation: 0,
  pieceX: 0,
  pieceY: 0,
  lastGravity: now(),
  lastLockReset: now(),
  lastLock: now(),
  hasEnded: false
})

var foldGrids = (g1, g2) =>
  g1.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
          Math.max(cell, g2.get(rowIndex).get(cellIndex))
      )
  )

var nudgeDown = (state) => state.set('pieceY', state.get('pieceY') + 1)
var nudgeRight = (state) => state.set('pieceX', state.get('pieceX') + 1)
var nudgeLeft = (state) => state.set('pieceX', state.get('pieceX') - 1)

var isOverlapping = (g1, g2) =>
  g1.find((row, rowIndex) =>
    row.find((cell, cellIndex) =>
      cell > 0 && g2.get(rowIndex).get(cellIndex) > 0
    )
  ) !== undefined

var withinBounds = (x, y) => x >= 0 && x < 10 && y < 20

var nonEmptyCellCoordinates = function(state) {
  if (state.get('currentPiece')) {
    return state.get('currentPiece').get(state.get('pieceRotation')).flatMap(function(row, rowIndex) {
      return row.flatMap((cell, cellIndex) => cell > 0 ? List.of(List.of(cellIndex + state.get('pieceX'), rowIndex + state.get('pieceY'))) : List.of())
    })
  } else {
    return List.of()
  }
}

var moveIsOutOfBounds = (fn, state) => nonEmptyCellCoordinates(fn(state)).some((coords) => !withinBounds(coords.get(0), coords.get(1)))

var isLegalMove = (fn, state) =>
  state.get('currentPiece') !== undefined
    && !moveIsOutOfBounds(fn, state)
    && !isOverlapping(currentPieceInGrid(fn(state)), state.get('environment'))

var SPAWN_DELAY = 30

var initialRotation = function(state) {
  if (state.get('inputs').get('x')) {
    return 1
  } else if (state.get('inputs').get('z')) {
    return -1
  } else {
    return 0
  }
}

var nextPiece = function(state) {
  if (state.get('currentPiece') === undefined && framesSince(state.get('lastLock')) > SPAWN_DELAY) {
    var piece = state.get('nextPieces').first().get('piece')
    var startY = piece === pieces.asMap.get('i') ? -1 : -2
    return state
      .set('currentPiece', piece)
      .set('pieceX', 3)
      .set('pieceY', startY)
      .set('pieceRotation', initialRotation(state))
      .set('nextPieces', state.get('nextPieces').slice(1).push(
        Map({ piece: getRandomPiece(), nth: state.get('nextPieces').last().get('nth') + 1 })
      ))
  } else {
    return state
  }
}

var lockPiece = function(state) {
  var isLockedAlready = state.get('currentPiece') === undefined
  if (isLockedAlready) {
    return state
  } else {
    return state
      .set('environment', foldGrids(state.get('environment'), currentPieceInGrid(state)))
      .set('lastLock', now())
      .set('currentPiece', undefined)
  }
}

var gravityMoveDown = function(state) {
  if (isLegalMove(nudgeDown, state)) {
    return nudgeDown(state).set('lastLockReset', now())
  } else {
    if (framesSince(state.get('lastLockReset')) > 60) {
      return lockPiece(state)
    } else {
      return state
    }
  }
}

var playerMoveDown = function(state) {
  if (isLegalMove(nudgeDown, state)) {
    return nudgeDown(state).set('lastLockReset', now())
  } else {
    return lockPiece(state)
  }
}

var drop = function(state) {
  while (isLegalMove(nudgeDown, state)) {
    state = nudgeDown(state)
  }
  return state.set('lastLockReset', now())
}

var moveLeft = function(state) {
  if (isLegalMove(nudgeLeft, state)) {
    return nudgeLeft(state)
  } else {
    return state
  }
}
var moveRight = function(state) {
  if (isLegalMove(nudgeRight, state)) {
    return nudgeRight(state)
  } else {
    return state
  }
}
var pressedInput = (inputType) =>
  inputStream
    .map((inputs) => inputs.get(inputType))
    .toEventStream()
    .skipDuplicates()
    .filter((isPressed) => isPressed)

var removeCompleteLines = function(state) {
  var incompleteLines = state.get('environment').filter((row) => row.some((cell) => cell === 0))
  var newEmptyLines = Immutable.Repeat(EMPTY_ROW, 20 - incompleteLines.size).toList()
  return state.set('environment', newEmptyLines.concat(incompleteLines))
}
var cycle = function(n, max, dir) {
  if (n + dir < 0) {
    return max
  } else if (n + dir > max) {
    return 0
  } else {
    return n + dir
  }
}

var composeMoves = (f1, f2) =>
  (state) => f2(f1(state))

var tryMove = (move, state) => isLegalMove(move(state)) ? move(state) : state

var tryMoves = function(moves, state) {
  var legalMove = moves.find((move) => isLegalMove(move, state))
  if (legalMove) {
    return legalMove(state)
  } else {
    return state
  }
}

var canMove = (moves, state) => moves.find((move) => isLegalMove(move, state)) !== undefined

var rotateRight = (state) =>
  state.set('pieceRotation', cycle(state.get('pieceRotation'), state.get('currentPiece').size - 1, 1))
var rotateLeft = (state) =>
  state.set('pieceRotation', cycle(state.get('pieceRotation'), state.get('currentPiece').size - 1, -1))

var wallKickRight = List.of(
  rotateRight,
  composeMoves(nudgeRight, rotateRight),
  composeMoves(nudgeLeft, rotateRight)
)
var wallKickLeft = List.of(
  rotateLeft,
  composeMoves(nudgeRight, rotateLeft),
  composeMoves(nudgeLeft, rotateLeft)
)

var rotateRightIfLegal = (state) =>
  canMove(wallKickRight, state) ? tryMoves(wallKickRight, state).set('lastLockReset', now()) : state
var rotateLeftIfLegal = (state) =>
  canMove(wallKickLeft, state) ? tryMoves(wallKickLeft, state).set('lastLockReset', now()) : state


var actionStream = (inputType, fn) => pressedInput(inputType).map(() => (state) => fn(state))

var FPS = 60

var FRAME = 1000 / FPS

var frames = (n) => n * FRAME

var framesSince = (t) => (now() - t) / FRAME

var gravity = function(state) {
  if (framesSince(state.get('lastGravity')) >= 30) {
    return gravityMoveDown(state.set('lastGravity', now()))
  } else {
    return state
  }
}

var tick = Bacon.interval(FRAME, (state) => gravity(state))

var allActions = Bacon.mergeAll(
  inputStream.map((inputs) => (state) => state.set('inputs', inputs)),
  actionStream("down", playerMoveDown),
  actionStream("left", moveLeft),
  actionStream("right", moveRight),
  actionStream("up", drop),
  actionStream("z", rotateLeftIfLegal),
  actionStream("x", rotateRightIfLegal),
  tick
)

var setLockingState = (state) =>
  state.set('isLocking', !isLegalMove(nudgeDown, state))

var checkGameEnd = (state) =>
  isOverlapping(state.get('environment'), currentPieceInGrid(state)) ? state.set('hasEnded', true) : state


var nextTick = function(state, fn) {
  var state = fn(state)
  state = removeCompleteLines(state)
  state = nextPiece(state)
  state = checkGameEnd(state)
  state = setLockingState(state)
  return state
}

var tick = allActions.scan(initialState, nextTick).takeWhile((state) => state.get('hasEnded') === false)

module.exports = {
  worldStream: tick
}