var tidy = require('htmltidy').tidy,
    q = require('q');

module.exports = function htmlTidy(){
    return {
        $runAfter: ['rendering-docs'],
        $runBefore : ['writing-files'],
        $process: function (docs) {
            return q.all(docs.map(function(doc){
                var deferred = q.defer();
                doc.renderedContent = tidy(doc.renderedContent, { indent : true}, function(err, result){
                    doc.renderedContent = result;
                    deferred.resolve(doc);
                });
                return deferred.promise;
            }))
        }
    };
};