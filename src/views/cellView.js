var React = require('react')
var pieces = require('../pieces')
var EMPTY_CELL = pieces.EMPTY_CELL
var {List} = require('immutable')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin

var rgbToString = (list) => 'rgb(' + list.toJS().join(', ') + ')'

var lighten = (rgb) => rgb.map((n) => Math.ceil(Math.min(n * 1.3, 255)))
var darken = (rgb) => rgb.map((n) => Math.floor(n * 0.7))

var getColor = function(cell) {
  if (cell === EMPTY_CELL) {
    return List.of(0, 0, 0)
  } else {
    if (cell.get('isLocking')) {
      return darken(cell.get('baseColor'))
    } else if (cell.get('isGhost')) {
      return List.of(80, 80, 80)
    } else {
      return cell.get('baseColor')
    }
  }
}

var Cell = React.createClass({
  mixins: [PureRenderMixin],
  render: function(){
    var size = this.props.size || 20
    var color = getColor(this.props.cell)
    var style = {
      display: "inline-block",
      boxSizing: 'border-box',
      width: size + "px",
      height: size + "px",
      backgroundColor: rgbToString(color),
      borderTop: '1px solid ' + rgbToString(lighten(color)),
      borderLeft: '1px solid ' + rgbToString(lighten(color)),
      borderBottom: '1px solid ' + rgbToString(darken(color)),
      borderRight: '1px solid ' + rgbToString(darken(color))
    }
    return <span style={style}></span>
  }
})

module.exports = Cell