test:
	@./node_modules/.bin/mocha

compile:
	@node ./bin/builder.js
