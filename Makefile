SOURCE ?= lib/client/jquery.js

test:
	@./node_modules/.bin/mocha

compile:

.PHONY: compile test
