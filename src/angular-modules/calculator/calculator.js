/**
 * @description facade bringing together calculator functions
 */
angular.module('calculator').service('calculator', function(addition, subtraction){
    return {
        /**
         * @method add
         * @param {int} left the first parameter to add
         * @param {int} right the second parameter to add
         * @returns {int} the sum of the 2 paramaters
         */
        add : addition.add,
        /**
         * @method subtract
         * @description subtracts 2 numbers
         * @param {int} left first number to subtracted from
         * @param {int} right second number to subtract from left
         * @returns {int} left - right
         */
        subtraction : subtraction.subtract
    };
})