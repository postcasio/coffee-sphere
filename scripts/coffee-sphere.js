/**
 * coffee-sphere
 * simple wrapper for coffeescript in sphere.
 * cc-by-nc dom@casiotone.org
 *
 * implements a simplistic commonjs module system.
 *
 * require(module)
 *   returns the module. paths beginning with "." or ".."
 *   are relative to the current file's path. otherwise
 *   they are from the "scripts" directory. do not include
 *   the file extension.
 *
 * modules have some special variables available to them.
 *
 * module
 *   an object containing metadata about the module.
 *
 * exports
 *   alias to module.exports. this is what is returned
 *   from a call to require(), and is just an empty object.
 *
 * assign values to exports to expose them.
 *   exports.value = 5     # require() returns { value: 5 }
 * to expose a single value other than an object, assign to module.exports.
 *   module.exports = 5    # require() returns 5
 *
 */
var game;

(function() {
	var log = OpenLog('require.log');
	RequireScript("coffee-script.js");

	function debug(obj, r) {
		var result = typeof obj;
		switch (result) {
			case 'string':
				result += " \"" + obj + "\" ";
				break;
			case 'object':
				result += "{ ";
				for (var i in obj) {
					result += i + ': ' + debug(obj[i], true) + ' ';
				}
				result += "} ";
				break;
			case 'function':
				result = obj.toString() + ' ';
				break;
			case 'undefined':
				result += ' ';
				break;
			default:
				result += obj.toString() + " ";
				break;
		}
		
		if (r) {
			return result;
		}
		else {
			Abort(result);
		}
	}
	
	function createRequire(dir) {
		return function(script) {
			if (script.substr(0, 2) == './') {
				var path = dir + '/' + script;
			}
			else if (script.substr(0, 3) == '../') {
				var path = dir + '/' + script;
			}
			else {
				var path = '../scripts/' + script;
			}
			
			return Module.find(normalise(path));
		}
	}
	
	function basename(d) {
		if (d.indexOf('/') == -1) {
			return '';
		}
		else {
			return d.substr(0, d.lastIndexOf('/'));
			
		}
	}
	
	function normalise(path) {
		var parts = path.split('/');
		var reconstructed = [];
		
		for (var i in parts) {
			if (parts[i] == '..' && reconstructed.length) {
				reconstructed.pop();
			}
			else if (parts[i] != '.' && parts[i] != '') {
				reconstructed.push(parts[i]);
			}
		}

		return (path.substr(0, 1) == '/' ? '/' : '') + reconstructed.join('/');
	}
	
	function Module(path) {
		this.path = path;
		this.module = {
			exports: {}
		};
		
		var file = OpenRawFile(path + '.coffee');
		this.source = CreateStringFromByteArray(file.read(file.getSize()));
		this.javascriptSource = CoffeeScript.compile(this.source);
	}
	
	Module.prototype.exec = function() {
		var require = createRequire(basename(this.path))
		var module = this.module;
		var exports = module.exports;
		
		eval(this.javascriptSource, null);
	}
	
	Module.list = {};
	
	Module.find = function(path) {
		if (Module.list[path]) {
			log.write('found ' + path + ' in cache');
			return Module.list[path].getExports();
		}

		log.beginBlock('loading ' + path);
		var module = new Module(path);
		Module.list[path] = module;
		
		module.exec();
		
		log.endBlock();
		return module.getExports();
		
	};
	
	Module.prototype.getExports = function() {
		return this.module.exports;
	};
	
	game = createRequire()('game');
})();