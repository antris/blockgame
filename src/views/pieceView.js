var React = require('react')
var Cell = require('./cellView')
var {List} = require('immutable')
var EMPTY_PIECE = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0)
  )
)
var Piece = React.createClass({
  render: function(){
    var rotations = this.props && this.props.piece || EMPTY_PIECE

    var view = rotations.get(0).map((row) =>
        <div>{row.map((cell) => <Cell cellType={cell} size="10"></Cell>).toJS()}</div>
    ).toJS()
    return <div>{view}</div>
  }
})
module.exports = Piece
