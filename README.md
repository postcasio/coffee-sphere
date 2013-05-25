# coffee-sphere

simple wrapper for coffeescript in [Sphere](https://github.com/sphere-group/sphere).

cc-by-nc dom@casiotone.org

# usage

place in scripts directory along with coffee-script.js. make sure coffee-sphere.js is your initial script. it will load game.coffee as a module, which should return a function that will be assigned to sphere's 'game' function!

e.g.

	module.exports = ->
		MapEngine("whatever.rmp", 60)