var React = require('react')
var pieces = require('../pieces')

var PieceView = React.createClass({
  render: function(){
    var piece = this.props.piece
    return <span className="pce">{pieces.toString(piece)}</span>
  }
})

module.exports = React.createClass({
  render: function() {
    var nextPieces = this.props.pieces
    return <div>
      <h2>Next pieces</h2>
      <p>{
        nextPieces
          .map(
            (piece) =>
              <PieceView piece={piece.get("piece")} key={piece.get("nth")} />
          )
          .toJS()
      }</p>
    </div>
  }
})