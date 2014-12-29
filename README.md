# documenting angular apps with dgeni (a proof of concept)
The intent of this proof of concept is to figure out how to use dgeni
and get it to produce the output that I want.

dgeni appears to be great, but it is not very opinionated. With tools like this we need to be very clear about what we want or else we'll be stuck scratching our heads...

So what do we want?

I want a single file (html for now), that easily allows me to document my angular modules and their services, directives, filters, etc. I expect the documentation to live with my code, and the output should be in context, meaning I have modules, and modules have services, etc.

In reading the angular config - it became obvious to me that you need a processor to restructure the documents they way you want them in the final output. This is not obvious at first...

Effectively each comment block is interpreted by jsdocs as a document, and without opinions, dgeni will give you that big flat array of documents. It is on you to structure those documents. Of course the next logical step is to use dgeni-packages/ngdocs, but it is quite complex and comes with a lot of complexity and assumptions, which is where I think most people fall short.

For example, it is going to group things into areas, which unless you are a contributor to angular, means nothing. It also is going to infer things using the angular source folder structure, for example (area.js)[https://github.com/angular/dgeni-packages/blob/master/ngdoc/tag-defs/area.js]

```
// Other files compute their area from the first path segment
return (doc.fileInfo.extension === 'js') ? 'api' : doc.fileInfo.relativePath.split('/')[0];
```

In not getting ngdocs to work (later realizing it is for the above reasons), I dove in and decided I need to better understand dgeni, and sit on top of jsdocs and add my own opinions.

In my first iteration, I added a few new tags which took very little code

```
// inject custom tags
.config(function(parseTagsProcessor, getInjectables) {
    parseTagsProcessor.tagDefinitions =
        parseTagsProcessor.tagDefinitions.concat(getInjectables(require('./dgeni/tag-defs')));
})
```

and here is an example tag

```
module.exports = function() {
    return {
        name: 'ng-module'
    };
};
```

The tag can do more advanced things, but I don't need it to right now, out of the box this populates doc['ng-module']... for example

```
/**
 * @ng-module test
 */

//  results in doc['ng-module'] === 'test'
```

I then needed to fold my documents together into a logical angular app. So I added my own processor `normalizeAngularApp.js`

```
module.exports = function normalizeAngularApp(){
    return {
        $runAfter: ['paths-computed'],
        $runBefore : ['rendering-docs'],
        $process: function (docs) {
            // group docs into my own document
        }
    };
};
```

I needed to run after `paths-computed` otherwise it would bomb expecting some properties to be set and before `rendering-docs` because I want the template to be ran against my document structure, not the flat one coming out of jsdocs.

Next I needed to template out my structure. dgeni knows about docs/templates/index.template.html, which will receive my document. Then nunjucks templating handles bringing in a layout and partials for each view type. This doesn't need to be html and doesn't need to be nunjucks, but both are best for this simple proof of concept.

<img src="screenshots/Screen Shot 2014-12-29 at 12.39.13 PM.png">

