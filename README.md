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

## Phase 2

At this point I am not feeling great about dgeni. I have full control and can easily add my own tags, but I have gained considerable complexity. What would make this more worth while is if I can infer some tags... Turns out I can using the AST.

```
function canInferService(item){

    return item.fileInfo.ast.body[0].expression &&
        item.fileInfo.ast.body[0].expression.callee &&
        item.fileInfo.ast.body[0].expression.callee.property &&
        item.fileInfo.ast.body[0].expression.callee.property.name === 'service' &&
        item.fileInfo.ast.body[0].expression.callee.object &&
        item.fileInfo.ast.body[0].expression.callee.object.callee &&
        item.fileInfo.ast.body[0].expression.callee.object.callee.object.name === 'angular' &&
        item.fileInfo.ast.body[0].expression.callee.object.callee.property &&
        item.fileInfo.ast.body[0].expression.callee.object.callee.property.name === 'module';
}
function canInferModule(item){
    return item.fileInfo.ast.body[0].expression &&
        item.fileInfo.ast.body[0].expression.callee &&
        item.fileInfo.ast.body[0].expression.callee.object &&
        item.fileInfo.ast.body[0].expression.callee.object.name === 'angular' &&
        item.fileInfo.ast.body[0].expression.callee.property &&
        item.fileInfo.ast.body[0].expression.callee.property.name === 'module' &&
        item.fileInfo.ast.body[0].expression.arguments.length === 2;
}
```

I can then populate the values

```
var module = item.fileInfo.ast.body[0].expression.callee.object.arguments[0].value,
    service = item.fileInfo.ast.body[0].expression.arguments[0].value;
item['ng-module'] = module;
item['ng-service'] = service;
```

So now

```
/**
 * @description all things addition
 */
angular.module('addition-module')
.service('addition', function(){
    //...
});
```

creates a document with the following

```
    {
        'ng-module' : 'addition-module',
        'ng-service' : 'addition',
        description : 'all things addition'
    }
```

This is more like it.

## More Angular Types

This is all great, but I need to be able to support other angular types... for example directives and / or filters.

Getting basic support for directives isn't too bad

```
/**
* @description creates markup for the addition symbol
* @usage `<add-symbol></add-symbol>`
*/
angular.module('addition').directive('addSymbol', function(){
 return {
     // not important
 };
});
```

Also updated `normalizeAngularApp` to infer and organize `ng-directive` and add templates.

Most frustrating was getting `<add-symbol></add-symbol>` working... Looking at angular source I finally ended up using `| marked` which kind of works... In hind sight, I think my html tidy is what might have been stripping it out...

<img src="screenshots/Screen Shot 2014-12-29 at 1.51.10 PM.png">

But that isn't enough... directive attributes desperately need documentation. Especially to indicate whether they are parsed or interpolated.

```js
/**
 * @description calculator control that takes an optional input and callbacks back with
 *  the result when someone enters a second number and does a calculation
 * @param {$parse(number)} intial-value optional initial value for the calculator. $parsed.
 * @param {expression} on-calculated callback when a value has been calculated. Exposes `result` as the new calculated value
 *
 * @usage `<my-calculator
 *      [initial-value="1"]
 *      [on-calculated="log(result)"]>
 *  </my-calculator>`
 */
angular.module('calculator').directive('myCalculator', function(){
    // not important
});
```

Note: I could try and get the params closer to the scope (implied), but 1) this is just a proof of concept, and 2) we could when we want to, its easy enough to add

<img src="screenshots/Screen Shot 2014-12-29 at 3.00.54 PM.png">

But wait... filters are special too...

More of the same really, and the result is... 

<img src="screenshots/Screen Shot 2014-12-29 at 3.44.39 PM.png">