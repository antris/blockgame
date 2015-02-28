var React = require('react')
var {stackStream, next} = require('./nextPiece')
var Bacon = require('baconjs')
var NextPiecesView = require('./views/nextPiecesView')
var playFieldStream = require('./playField')
var PlayField = require('./views/playFieldView')

var worldStream = Bacon.combineTemplate({
  stack: stackStream,
  playField: playFieldStream
})

var Main = React.createClass({
  render: function() {
    return <div>
      <NextPiecesView pieces={this.props.world.stack} />
      <PlayField playField={this.props.world.playField} />
    </div>
  }
})

var Initializer = React.createClass({
  componentDidMount: function() {
    var component = this
    this.props.worldStream.onValue((world) => component.setState({ world }))
  },
  render: function() {
    return this.state && this.state.world ? <Main world={this.state.world} /> : <div />
  }
})

React.render(
  <Initializer worldStream={worldStream} />,
  document.getElementById('main')
)