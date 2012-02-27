REPORTER=spec
GROWL="--growl"

test::
	./node_modules/mocha/bin/mocha ${GROWL} -c --reporter ${REPORTER} ./spec/helper.js spec/*-spec.js spec/commands/*-spec.js
