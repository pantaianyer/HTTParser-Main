# Run jest tests
test::
	NODE_OPTIONS=--experimental-vm-modules npx jest .

# Publish to NPM
publish::
	npm publish --access public
