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