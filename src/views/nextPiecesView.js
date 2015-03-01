var React = require('react')
var pieces = require('../pieces')
var Piece = require('./pieceView')

module.exports = React.createClass({
  render: function() {
    var nextPieces = this.props.pieces
    return <div>
      <strong>Next pieces</strong>
      <div>{
        nextPieces
          .map(
            (piece) =>
              <Piece piece={piece.get("piece")} key={piece.get("nth")} />
          )
          .toJS()
      }</div>
    </div>
  }
})