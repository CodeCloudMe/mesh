all:{{#each platforms}} {{this}}{{/each}}

clean: 
	rm -rf ./lib

{{#each platforms}}
{{this}}:
	mesh make {{this}} 
{{/each}}