var React = require('react')
var pieces = require('../pieces')
var EMPTY_CELL = pieces.EMPTY_CELL

var getColor = function(cell) {
  if (cell === EMPTY_CELL) {
    return 'black'
  } else {
    if (cell.get('isLocking')) {
      return cell.get('lockingColor')
    } else {
      return cell.get('baseColor')
    }
  }
}

var Cell = React.createClass({
  render: function(){
    var size = this.props.size || 20
    var style = {
      display: "inline-block",
      width: size + "px",
      height: size + "px",
      backgroundColor: getColor(this.props.cell)
    }
    return <span style={style}></span>
  }
})

module.exports = Cell