all:
	mkdir ./lib
	cp -R ./src/default ./lib/default
	coffee -o lib -c src	
	find ./lib -name "*.coffee" -exec rm {} \;

clean:
	rm -rf lib