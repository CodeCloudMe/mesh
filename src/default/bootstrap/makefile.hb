all:{{#each platforms}} {{this}}{{/each}}

{{#each platforms}}
{{this}}:
	./node_modules/mesh/bin/mesh make {{this}} 
{{/each}}