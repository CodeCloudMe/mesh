make all:  {{#platforms}} {{name}} {{/platforms}}

{{#platforms}}
make {{name}}:
	./node_modules/mesh/ make {{name}} --input=./src --output=./lib 
{{/platforms}}