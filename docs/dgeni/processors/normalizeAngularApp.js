module.exports = function normalizeAngularApp(){
    return {
        $runAfter: ['paths-computed'],
        $runBefore : ['rendering-docs'],
        $process: function (docs) {
            var normalized = docs.reduce(function (memo, item) {

                // infer some stuff
                // TODO: this should probably be a pre-processor
                if (canInferModule(item)) {
                    item['ng-module'] = item.fileInfo.ast.body[0].expression.arguments[0].value;
                }
                if (canInferService(item)){
                    item['ng-service'] = item.fileInfo.ast.body[0].expression.arguments[0].value;
                    item['ng-module'] = item.fileInfo.ast.body[0].expression.callee.object.arguments[0].value;
                }
                if (canInferDirective(item)){
                    item['ng-directive'] = item.fileInfo.ast.body[0].expression.arguments[0].value;
                    item['ng-module'] = item.fileInfo.ast.body[0].expression.callee.object.arguments[0].value;
                }
                if (canInferFilter(item)){
                    item['ng-filter'] = item.fileInfo.ast.body[0].expression.arguments[0].value;
                    item['ng-module'] = item.fileInfo.ast.body[0].expression.callee.object.arguments[0].value;
                }
                if (canInferRun(item)){
                    item['ng-run'] = true;
                    item['ng-module'] = item.fileInfo.ast.body[0].expression.callee.object.arguments[0].value;
                }

                // build new document structure

                // if ng-module - create the module if it doesn't exist
                if (item['ng-module'] && !memo.modules[item['ng-module']]){
                    memo.modules[item['ng-module']] = {
                        services : [],
                        directives : [],
                        filters : [],
                        runBlocks : [],
                        type : 'ng-module',
                        id : item['ng-module']
                    };
                }

                // TODO: need better way of handling this... probably item['ng-type']
                if (item['ng-module'] &&
                    !item['ng-service'] &&
                    !item['ng-directive'] &&
                    !item['ng-filter'] &&
                    !item['ng-run']
                ){
                    memo.modules[item['ng-module']].description = item.description;
                    memo.parentDoc = item;
                }
                // ng-service - add to the module
                else if (item['ng-module'] && item['ng-service'] && !item.method){
                    // TODO: tag ng-service should require ng-module
                    extend(item, {
                        methods : [],
                        type : 'ng-service',
                        id : item['ng-module'] + '.' + item['ng-service']
                    });

                    memo.modules[item['ng-module']].services.push(item);
                    memo.parentDoc = item;
                }
                // ng-directive - add to the module
                else if (item['ng-module'] && item['ng-directive']){
                    extend(item, {
                        type : 'ng-directive',
                        id : item['ng-module'] + '.' + item['ng-directive']
                    });

                    memo.modules[item['ng-module']].directives.push(item);
                    memo.parentDoc = item;
                }
                // ng-directive - add to the module
                else if (item['ng-module'] && item['ng-filter']){
                    extend(item, {
                        type : 'ng-filter',
                        // TODO: uniquify filters and directives under some artificial namespace
                        id : item['ng-module'] + '.' + item['ng-filter']
                    });

                    memo.modules[item['ng-module']].filters.push(item);
                    memo.parentDoc = item;
                }
                else if (item['ng-module'] && item['ng-run']){
                    extend(item, {
                        type : 'ng-run',
                        id : item['ng-module'] + '.' + item['ng-run']
                    });

                    memo.modules[item['ng-module']].runBlocks.push(item);
                    memo.parentDoc = item;
                }
                // if this is in the same file as the previous doc, assume it is part of the last doc
                else if (memo.parentDoc && item.fileInfo.relativePath === memo.parentDoc.fileInfo.relativePath && item.method && memo.parentDoc.methods){
                    extend(item, {
                        type : 'method',
                        id : memo.parentDoc['ng-module'] + '.' + memo.parentDoc['ng-service'] + '.' + item.method
                    });

                    memo.parentDoc.methods.push(item);
                }
                else{
                    memo.parentDoc = null;
                    memo.nonAngularDocs.push(item);
                }

                item.json = JSON.stringify(item, null, 2);

                return memo;
            }, {modules: {}, nonAngularDocs : [], parentDoc: null});
            var docs = [{
                docType : 'js',
                modules : mapToArray(normalized.modules, 'name'),
                nonAngularDocs : normalized.nonAngularDocs,
                type : 'ng-modules',
                outputPath: 'index.html'
            }];

            // shouldn't be writing from here - but proving something out
            require('fs').writeFileSync('docs/build/index.json', JSON.stringify(docs[0].modules, null, 2));
            var lessJson = JSON.stringify(docs[0].modules, function(key, value){
                if (['fileInfo','codeNode','tags', 'codeAncestors', 'tagDef'].indexOf(key) === -1){
                    return value;
                }
                else{
                    return null;
                }
            }, 2);
            require('fs').writeFileSync('docs/build/index.less.json', lessJson);

            require('fs').writeFileSync('docs/build/index.js', 'angular.module(\'docs-data\',[]).value(\'docs\', ' + lessJson + ');');
            return docs;
        }
    };
};

function canInferService(item){
    return canInferAngularModuleFunction('service', item);
}

function canInferRun(item){
    return canInferAngularModuleFunction('run', item);
}

function canInferFilter(item){
    return canInferAngularModuleFunction('filter', item);
}

function canInferDirective(item){
    return canInferAngularModuleFunction('directive', item);
}

function canInferAngularModuleFunction(name, item){
    return item.fileInfo.ast.body[0].expression &&
        item.fileInfo.ast.body[0].expression.callee &&
        item.fileInfo.ast.body[0].expression.callee.property &&
        item.fileInfo.ast.body[0].expression.callee.property.name === name &&
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


function extend(to, from){
    Object.keys(from).forEach(function(key){
        to[key] = from[key];
    });
}

function mapToArray(map, keyProperty){
    return Object.keys(map).map(function(prop){
        map[prop][keyProperty] = prop;
        return map[prop];
    });
}