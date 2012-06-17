module.exports = {
	"def help": {
		"run": run
	}
}

var celeri = require("celeri");

function capitalizeFirst(str) {
    return str.substr(0,1).toUpperCase() + str.substr(1);
}

var helpMenu = function() {

    var usage, 
    desc, 
    items = {}, 
    used = {}, 
    children = {};
    

    var self = {

        /**
         */

        description: function(value) {
            
            desc = value;
              
        },

        /**
         */

        usage: function(value) {

            usage = value;

        },
            
        /**
         * adds a help item
         */

        add: function(category, name, desc) {

            if(used[name]) return;
            used[name]= 1;

            if(!items[category]) items[category] = [];
            
           items[category].push({
               name: name,
               desc: desc
           });


        },

        /**
         */

        child: function(name) {
            return children[name] || (children[name] = helpMenu());
        },

        /**
         */

        print: function() {

            //line break
            console.log();

            if(desc) {
                console.log('%s\n'.bold, desc);
            }
            
            if(usage) console.log('%s: %s\n', 'Usage'.bold, usage);

            for(var category in items) {
                
                console.log('%s:'.bold, capitalizeFirst(category));

                var ops = {
                    columns: {
                        name: 16,
                        desc: 70
                    },
                    pad: {
                        left: 2
                    }
                };



                celeri.table(items[category], ops);  
                console.log();  
            }
        }
    };

    return self;
}


function run(target, next) {

	//blah. shouldn't be accessing private methods
	var ci = target.parser._evaluator.commands.commandInfo;

	var help = helpMenu();
	// help.add("help", ":command help", "show specific command help");
	help.add("help", "help", "show help menu");

	for(var key in ci) {
		var command = ci[key];

		help.add("commands", command.command, command.description);

		/*console.log(command.command.bold + spacing + command.description);

		for(var i = command.params.length; i--;) {
			var param = command.params[i];
			console.log(spacing + "--" + param.property.bold + (param.value ? "=" + param.value : "") + spacing + (param.description || ""))
		}

		console.log("\n");*/
	}

	help.print();
    next();
}