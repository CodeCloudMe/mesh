all:{{#each platforms}} {{this}}{{/each}}

clean: 
	rm -rf ./lib

{{#each platforms}}
{{this}}:
	./node_modules/mesh/bin/mesh make {{this}} 
{{/each}}