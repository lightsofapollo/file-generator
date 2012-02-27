var Generator = require('file-generator'),
    generator = new Generator({
      templatePaths: [
        __dirname + '/templates/'
      ],
      target: __dirname + '/output'
    });

generator.template('package.json');

generator.variables.set('package', {
  name: 'myFoo2',
  version: '1.0'
});

generator.run(function(){
  console.log('Complete');
});
