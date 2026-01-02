hello:
	@echo "Hello, World!"

bash:
	@bash hello-world.sh

python:
	@python3 hello-world.py

node:
	@node hello-world.js

all: hello bash python node
	@echo "All done!"
