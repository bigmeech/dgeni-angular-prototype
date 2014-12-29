/**
 * @description subtraction functions
 */
angular.module('subtraction').service('subtraction', function(){
    return {
        /**
         * @method subtract
         * @description subtracts 2 numbers
         * @param {int} left first number to subtracted from
         * @param {int} right second number to subtract from left
         * @returns {int} left - right
         */
        subtract : function(left, right){
            return left - right;
        }
    };
});