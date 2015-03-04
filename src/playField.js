var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List, Map} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10).toList()
var EMPTY_GRID = Immutable.Repeat(EMPTY_ROW, 20).toList()
var {getLockDelay, getGravityDelay} = require('./levelData')

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
  score: 0,
  level: 0
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

var startY = (piece) => piece === pieces.asMap.get('i') ? -1 : -2

var nextPiece = function(state) {
  if (state.get('currentPiece') === undefined && framesSince(state.get('lastLock')) > SPAWN_DELAY) {
    var piece = state.get('nextPieces').first().get('piece')
    return state
      .set('currentPiece', piece)
      .set('pieceX', 3)
      .set('pieceY', startY(piece))
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
      .set('thisTick', state.get('thisTick').set('pieceGotLocked', true))
  }
}

var gravityMoveDown = function(state) {
  if (isLegalMove(nudgeDown, state)) {
    return nudgeDown(state).set('lastLockReset', now())
  } else {
    if (framesSince(state.get('lastLockReset')) > getLockDelay(state)) {
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

var isPressed = (inputType) => inputStream.map((inputs) => inputs.get(inputType)).skipDuplicates()
var pressedInput = (inputType) =>
  isPressed(inputType)
    .toEventStream()
    .filter((isPressed) => isPressed)


var removeCompleteLines = function(state) {
  var incompleteLines = state.get('environment').filter((row) => row.some((cell) => cell === 0))
  var completedLinesCount = 20 - incompleteLines.size
  var newEmptyLines = Immutable.Repeat(EMPTY_ROW, completedLinesCount).toList()
  var scoreToAdd = completedLinesCount * completedLinesCount * 10
  return state
    .set('environment', newEmptyLines.concat(incompleteLines))
    .set('score', state.get('score') + scoreToAdd)
    .set('thisTick', state.get('thisTick').set('completedLines', completedLinesCount))
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
  if (framesSince(state.get('lastGravity')) >= getGravityDelay(state)) {
    return gravityMoveDown(state.set('lastGravity', now()))
  } else {
    return state
  }
}

var holdPiece = function(state) {
  var currentPiece = state.get('currentPiece')
  var holdPiece = state.get('holdPiece')
  if (currentPiece) {
    if (holdPiece) {
      return state
        .set('holdPiece', currentPiece)
        .set('currentPiece', holdPiece)
        .set('pieceRotation', 0)
    } else {
      return nextPiece(
        state
          .set('holdPiece', currentPiece)
          .set('currentPiece', undefined)
      )
    }
  } else {
    if (holdPiece) {
      return state
        .set('holdPiece', undefined)
        .set('currentPiece', holdPiece)
        .set('pieceX', 3)
        .set('pieceY', startY(holdPiece))
        .set('pieceRotation', 0)
    } else {
      return state
    }
  }
}

var holdPieceTries = List.of(
  holdPiece,
  composeMoves(nudgeRight, holdPiece),
  composeMoves(nudgeLeft, holdPiece)
)

var holdPieceIfLegal = function(state) {
  if (canMove(holdPieceTries, state)) {
    return tryMoves(holdPieceTries, state)
  } else {
    return state
  }
}


var tick = Bacon.interval(FRAME, (state) => gravity(state))

var debug = function(state) { console.log(state.toJS()); return state }

var repeatWhenHolding = (stream) =>
  stream.flatMapLatest((isPressed) =>
    isPressed ? Bacon.once(true).merge(Bacon.interval(frames(3), true).delay(frames(16))) : Bacon.never()
  )

var allActions = Bacon.mergeAll(
  inputStream.map((inputs) => (state) => state.set('inputs', inputs)),
  actionStream("down", playerMoveDown),
  repeatWhenHolding(isPressed("left")).map(() => (state) => moveLeft(state)),
  repeatWhenHolding(isPressed("right")).map(() => (state) => moveRight(state)),
  actionStream("up", drop),
  actionStream("z", rotateLeftIfLegal),
  actionStream("x", rotateRightIfLegal),
  actionStream("d", holdPieceIfLegal),
  actionStream("m", debug),
  tick
)

var setLockingState = (state) => state.set('isLocking', !isLegalMove(nudgeDown, state))

var checkGameEnd = (state) =>
  isOverlapping(state.get('environment'), currentPieceInGrid(state)) ? state.set('gameEnded', now()) : state

var advanceLevel = function(state) {
  if (state.get('thisTick').get('pieceGotLocked')) {
    var current = state.get('level')
    var completedLines = state.get('thisTick').get('completedLines')
    var lineBonus = completedLines > 1 ? completedLines : 0
    if ((current + 1) % 100 == 0) {
      if (completedLines > 0) {
        return state.set('level', current + 1 + lineBonus)
      } else {
        return state
      }
    } else {
      return state.set('level', current + 1 + lineBonus)
    }
  } else {
    return state
  }
}

var resetTick = (state) => state.set('thisTick', Map({completedLines: 0}))

var nextTick = function(state, [action, paused]) {
  state = state.set('paused', paused)
  if (!state.get('gameEnded')) {
    if (!paused) {
      state = resetTick(state)
      state = action(state)
      state = removeCompleteLines(state)
      state = nextPiece(state)
      state = checkGameEnd(state)
      state = advanceLevel(state)
      state = setLockingState(state)
    }
  }
  return state
}

var paused = Bacon.update(false,
  [pressedInput('p')], (prev) => !prev
)

var tick = Bacon.combineAsArray(allActions, paused).scan(initialState, nextTick)

module.exports = {
  worldStream: tick
}