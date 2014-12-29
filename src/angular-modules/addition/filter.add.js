/**
 * @description adds to the input parameter outputting the result of the addition
 * @usage `{{ 1 | add:2}}` or `$filter('add')(1, 2)`
 * @param {number} input the first number to be added
 * @param {number} first the second number to be added
 * @returns {number} the result of the two numbers
 */
angular.module('addition').filter('add', function(){
    // not important
});