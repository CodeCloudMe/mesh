all:{{#each platforms}} {{this}}{{/each}}

%:
	./node_modules/mesh/bin/cli make $@ --input=./src --output=./lib 
