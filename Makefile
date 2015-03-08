test:
	./node_modules/.bin/mocha

# Use blanket.js to test code coverage and output to ./coverage.html
test-cov:
	./node_modules/.bin/mocha --require blanket -R html-cov > coverage.html

.PHONY: test test-cov
