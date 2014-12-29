/* global angular:false */

/**
 * @description all things addition
 */
angular.module('addition')
.service('addition', function(){
    // TODO: what if I return a constructor, or a function
    return {
        /**
         * @method add
         * @description returns the sum of 2 parameters
         * @param {int} left the first parameter to add
         * @param {int} right the second parameter to add
         * @returns {int} the sum of the 2 parameters
         */
        add : function(left, right) {
            return left + right;
        }
    };
});