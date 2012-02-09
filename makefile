all:
	coffee -o lib -c src
	cp -R ./src/platform ./lib/platform	

clean:
	rm -rf lib