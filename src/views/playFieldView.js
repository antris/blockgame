var React = require('react')
var {List, Map} = require('immutable')
var pieces = require('../pieces')
var {EMPTY_CELL, EMPTY_GRID} = pieces
var Cell = require('./cellView')
var Bacon = require('baconjs')

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

var merge = (p1, p2) =>
  p1.map((row, y) =>
    row.map((cell, x) => cell === EMPTY_CELL ? p2.get(y).get(x) : cell)
  )

var withinBounds = (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20

var nonEmptyCellCoordinates = function(state) {
  if (state.get('currentPiece')) {
    return state.get('currentPiece').get(state.get('pieceRotation')).flatMap(function(row, rowIndex) {
      return row.flatMap((cell, cellIndex) => cell !== EMPTY_CELL ? List.of(
        Map({
          x: cellIndex + state.get('pieceX'),
          y: rowIndex + state.get('pieceY'),
          cell: cell.set('isLocking', state.get('isLocking'))
        })
      ) : List.of())
    })
  } else {
    return List.of()
  }
}

var setCell = (grid, x, y, cell) => grid.set(y, grid.get(y).set(x, cell))


var putCell = function(grid, coords) {
  var x = coords.get('x')
  var y = coords.get('y')
  if (y < 0) return grid
  return grid.set(y, grid.get(y).set(x, coords.get('cell')))
}

var currentPieceInGrid = function(state) {

  var cells = nonEmptyCellCoordinates(state)
  var g = cells
    .filter((coords) => withinBounds(coords.get('x'), coords.get('y')))
    .reduce(putCell, EMPTY_GRID)
  return g
}

var getCellCoordinatesForPiece = function(piece, rotation, x, y, isLocking, isGhost) {
  if (!piece) {
    return List.of()
  } else {
    return piece.get(rotation).flatMap(function(row, rowIndex) {
      return row.flatMap((cell, cellIndex) => cell !== EMPTY_CELL ? List.of(
        Map({
          x: cellIndex + x,
          y: rowIndex + y,
          cell: cell.set('isLocking', isLocking).set('isGhost', isGhost)
        })
      ) : List.of())
    })
  }
}

var pieceInGrid = function(piece, rotation, x, y, isLocking, isGhost) {
  var coords = getCellCoordinatesForPiece(piece, rotation, x, y, isLocking, isGhost)
  var grid2 = coords
    .filter((c) => withinBounds(c.get('x'), c.get('y')))
    .reduce(putCell, EMPTY_GRID)
  return grid2
}

var restarts = new Bacon.Bus()

var PlayField = React.createClass({
  render: function() {
    var world = this.props.world
    var style = {
      border: '10px solid #43494A',
      marginTop: '20px',
      float: 'left',
      marginRight: '20px'
    }
    var gameEnded = world.get('gameEnded')
    var timeSinceEnd = new Date().getTime() - gameEnded
    var hideAnimation = function(cell, rowIndex) {
      if (gameEnded) {
        if (timeSinceEnd > (20 - rowIndex) * 80) {
          return EMPTY_CELL
        } else {
          return cell
        }
      } else {
        return cell
      }
    }

    var shouldShowCell = (cell, rowIndex) => world.get('paused') ? EMPTY_CELL : hideAnimation(cell, rowIndex)

    var ghostPiece = world.get('ghostPiece')

    var ghostGrid;

    if (ghostPiece) {
      ghostGrid = pieceInGrid(ghostPiece.get('piece'), ghostPiece.get('rotation'), ghostPiece.get('x'), ghostPiece.get('y'), false, true)
    } else {
      ghostGrid = EMPTY_GRID
    }

    var grid = merge(
      merge(currentPieceInGrid(world), world.get('environment')),
      ghostGrid
    )

    var buttonStyle = {
      display: gameEnded && timeSinceEnd > 1680 ? 'block' : 'none',
      margin: '170px auto',
      cursor: 'pointer',
      lineHeight: '40px',
      width: '200px',
      background: '#333',
      textAlign: 'center',
      position: 'absolute'
    }

    var restart = function() { restarts.push(true) }

    return <div style={style}>
      <div style={buttonStyle} onClick={restart}>Restart</div>
      <div>
        {grid.map((row, rowIndex) =>
            <div>
          {
            row.map(function(cell) {
              return <Cell cell={shouldShowCell(cell, rowIndex)} />
            }).toJS()
            }
            </div>
        ).toJS()}
      </div>
    </div>
  }
})

module.exports = { PlayField, restartStream: restarts.toEventStream() }