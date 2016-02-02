SHELL:=/bin/bash -O extglob

lint:
	./node_modules/.bin/jshint -c .jshintrc lib/*.js lib/**/*.js examples/**/*.js promise/*.js promise/**/*.js

test:
	./node_modules/.bin/mocha

# Use blanket.js to test code coverage and output to ./coverage.html
test-cov:
	./node_modules/.bin/mocha --require blanket -R html-cov > coverage.html

.PHONY: test test-cov lint
