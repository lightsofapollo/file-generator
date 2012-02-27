var Generator = require('file-generator'),
    generator = new Generator({
      templatePaths: [
        __dirname + '/templates/'
      ],
      target: __dirname + '/output'
    }),
    variables = generator.variables;

generator.template('package.json');

variables.
  set('package.name', 'myPackage').
  set('package.version', '1.0');

generator.run(function(){
  console.log('Complete');
});
