SOURCE ?= lib/client/jquery.js
SOURCE_OUT ?= build/jayson.jquery.min.js

test:
	./node_modules/.bin/mocha

# Use blanket.js to test code coverage and output to ./coverage.html
test-cov:
	./node_modules/.bin/mocha --require blanket -R html-cov > coverage.html

compile:
	curl -s --data-urlencode js_code@$(SOURCE) --data-urlencode compilation_level=SIMPLE_OPTIMIZATIONS --data-urlencode output_format=text --data-urlencode output_info=compiled_code  http://closure-compiler.appspot.com/compile > $(SOURCE_OUT)

.PHONY: compile test
