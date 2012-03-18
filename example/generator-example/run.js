var Generator = require('file-generator'),
    generator = new Generator({
      templatePaths: [
        __dirname + '/templates/'
      ],
      target: __dirname + '/output'
    }),
    variables = generator.variables;

generator.template('package.json').
          mkdir('foo').
          mkdir('bar').
          mkdir('baz').
          template('foo/index.js');

generator.question('package.name', {
  prompt: "What is the name of your package? "
});

generator.question('main.function', {
  prompt: "What is the name of the primary function? ",
  defaultValue: "ReallyBadNameYouForgotToUpdate"
});

generator.question('package.version', {
  prompt: "What is the version for your package? ",
  defaultValue: '0.0.1'
});


generator.run(function(){
  console.log('Complete');
});
