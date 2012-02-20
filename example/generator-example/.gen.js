//This file will be run in the context of a vm which will expose this stuff.

//Direct copy
generator.file('my-file.txt');

//Copy + rename
generator.file('my-file.txt', 'dest.txt');

//Set variables for templates
generator.variables.foo = 'wow';

//Same deal here. Templates are exposed as handlebars and are given the .variables
generator.template('my-template.txt')

//Creates an empty directory 
//this is only need when you want just that
//all commands will accept a path and run a mkdirp to generate
//that path.
generator.mkdir('spec');
