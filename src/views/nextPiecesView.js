var React = require('react')
var pieces = require('../pieces')
var Cell = require('./cellView')

var PieceView = React.createClass({
  render: function(){
    var rotations = this.props.piece

    var view = rotations.get(0).map((row) =>
      <div>{row.map((cell) => <Cell cellType={cell} size="10"></Cell>).toJS()}</div>
    ).toJS()
    return <div>{view}</div>
  }
})

module.exports = React.createClass({
  render: function() {
    var nextPieces = this.props.pieces
    return <div>
      <strong>Next pieces</strong>
      <div>{
        nextPieces
          .map(
            (piece) =>
              <PieceView piece={piece.get("piece")} key={piece.get("nth")} />
          )
          .toJS()
      }</div>
    </div>
  }
})