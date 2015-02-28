var React = require('react')

var colors = {
  0: 'black',
  1: 'red',
  2: 'yellow',
  3: 'cyan',
  4: 'purple',
  5: 'green',
  6: 'lightblue',
  7: 'orange'
}

var Cell = React.createClass({
  render: function(){
    var style = {
      display: "inline-block",
      width: "20px",
      height: "20px",
      backgroundColor: colors[this.props.cellType]
    }
    return <span style={style}></span>
  }
})

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
  p1.map((y, yIndex) =>
    y.map((x, xIndex) => Math.max(x, p2.get(yIndex).get(xIndex)))
  )

var placePieceInGrid = function(grid, pieceRotations, rotation, x, y) {
  var piece = pieceRotations.get(rotation)
  var pieceHeight = piece.size
  var pieceWidth = piece.get(0).size
  var head = grid.slice(0, y)
  var body = grid.slice(y, y + pieceHeight).map(function(row, rowIndex) {
    var rowHead = row.slice(0, x)
    var rowBody = row.slice(x, x + pieceWidth).map((cell, cellIndex) => Math.max(cell, piece.get(rowIndex).get(cellIndex)))
    var rowTail = row.slice(x + pieceWidth)
    return rowHead.concat(rowBody).concat(rowTail)
  })
  var tail = grid.slice(y + pieceHeight)
  return head.concat(body).concat(tail)
}

module.exports = React.createClass({
  render: function() {
    var world = this.props.world
    return <div>
      {placePieceInGrid(world.get('environment'), world.get('currentPiece'), world.get('pieceRotation'), world.get('pieceX'), world.get('pieceY')).map((row) =>
        <div>
        {
          row.map(function(cell) {
            return <Cell cellType={cell} />
          }).toJS()
        }
        </div>
      ).toJS()}
    </div>
  }
})