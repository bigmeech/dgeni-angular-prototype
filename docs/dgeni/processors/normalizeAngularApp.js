module.exports = function normalizeAngularApp(){
    return {
        $runAfter: ['paths-computed'],
        $runBefore : ['rendering-docs'],
        $process: function (docs) {
            var normalized = docs.reduce(function (memo, item) {
                // if ng-module - create the module if it doesn't exist
                if (item['ng-module'] && !memo.modules[item['ng-module']]){
                    memo.modules[item['ng-module']] = {
                        services : [],
                        type : 'ng-module',
                        id : item['ng-module']
                    };
                }

                if (item['ng-module'] && !item['ng-service']){
                    memo.modules[item['ng-module']].description = item.description;
                    memo.parentDoc = item;
                }
                // ng-service - add to the module
                else if (item['ng-module'] && item['ng-service']){
                    // TODO: tag ng-service should require ng-module
                    extend(item, {
                        methods : [],
                        type : 'ng-service',
                        id : item['ng-module'] + '.' + item['ng-service']
                    });

                    memo.modules[item['ng-module']].services.push(item);
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

                return memo;
            }, {modules: {}, nonAngularDocs : [], parentDoc: null});
            return [{
                docType : 'js',
                modules : mapToArray(normalized.modules, 'name'),
                type : 'ng-modules',
                outputPath: 'index.html'
            }].concat(normalized.nonAngularDocs);
        }
    };
};


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