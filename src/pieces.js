var Immutable = require('immutable')
var {List} = Immutable

var i = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(1, 1, 1, 1),
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0)
  ),
  List.of(
    List.of(0, 0, 1, 0),
    List.of(0, 0, 1, 0),
    List.of(0, 0, 1, 0),
    List.of(0, 0, 1, 0)
  )
)
var o = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 2, 2, 0),
    List.of(0, 2, 2, 0)
  )
)
var t = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 3, 0, 0),
    List.of(3, 3, 3, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 3, 0, 0),
    List.of(0, 3, 3, 0),
    List.of(0, 3, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(3, 3, 3, 0),
    List.of(0, 3, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 3, 0, 0),
    List.of(3, 3, 0, 0),
    List.of(0, 3, 0, 0)
  )
)
var s = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 4, 4, 0),
    List.of(4, 4, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(4, 0, 0, 0),
    List.of(4, 4, 0, 0),
    List.of(0, 4, 0, 0)
  )
)
var z = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(5, 5, 0, 0),
    List.of(0, 5, 5, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 5, 0),
    List.of(0, 5, 5, 0),
    List.of(0, 5, 0, 0)
  )
)
var j = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(6, 6, 6, 0),
    List.of(0, 0, 6, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 6, 0, 0),
    List.of(0, 6, 0, 0),
    List.of(6, 6, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(6, 0, 0, 0),
    List.of(6, 6, 6, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(6, 6, 0, 0),
    List.of(6, 0, 0, 0),
    List.of(6, 0, 0, 0)
  )
)
var l = List.of(
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(7, 7, 7, 0),
    List.of(7, 0, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(7, 7, 0, 0),
    List.of(0, 7, 0, 0),
    List.of(0, 7, 0, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(0, 0, 0, 0),
    List.of(0, 0, 7, 0),
    List.of(7, 7, 7, 0)
  ),
  List.of(
    List.of(0, 0, 0, 0),
    List.of(7, 0, 0, 0),
    List.of(7, 0, 0, 0),
    List.of(7, 7, 0, 0)
  )
)
var asMap = Immutable.Map({ i, o, t, s, z, j, l })

var asList = List.of(i, o, t, s, z, j, l)

var colors = Immutable.Map().set(i, 1).set(o, 2).set(t, 3).set(s, 4).set(z, 5).set(j, 6).set(l, 7)

var toString = function(piece) {
  return asMap.keyOf(asList.find((p) => p == piece)).toUpperCase()
}

module.exports = { asMap, asList, toString, colors }