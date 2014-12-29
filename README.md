The intent of this proof of concept is to figure out how to use dgeni
and get it to produce the output that I want.

dgeni appears to be great, but it is not very opinionated. With tools like this we need to be very clear about what we want or else we'll be stuck scratching our heads...

So what do we want?

Given a module based angular app
When I generate documentation
Then There should be a single html file
And it should contain all of the modules with links to their dependent modules
And each module should contain all of the dependencies by type
And each dependency should explain how to use it
And I should be able to link from one service to another
And services should be deep linkable

In reading the angular config - it became obvious to me that you need a processor to restructure the documents they way you want them in the final output

So I want to end up with one document (in dgeni parlance), something that looks like this

    // index doc
    {
        type : 'ng-modules',
        modules : [] // see module doc
    }

    // module doc
    {
        type : 'ng-module',
        name  : '...',
        description : '...',
        services : [], // see service doc
        directives : [], // see directives doc
        filters : [] // see filters doc
    }

    // service doc
    {
        type : 'ng-service',
        name : '...',
        description : '...',
        methods : [], // see method doc
    }

