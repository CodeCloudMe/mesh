var haba = require('haba'),
pluginLoader = haba.loader();

pluginLoader.
options(pluginLoader, true).
require(__dirname + '/linked_plugins/**/*').
require(__dirname + '/plugins').
init();

module.exports = pluginLoader;