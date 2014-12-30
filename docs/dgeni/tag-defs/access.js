module.exports = function() {
    return {
        name: 'access',
        defaultFn : function(doc){
            return 'protected';
        }
    };
};