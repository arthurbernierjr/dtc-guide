const assert = require('node:assert/strict');
const merge = require('deepmerge');
const payload = JSON.parse('{"__proto__":{"poisoned":true},"normal":2}');
for (const result of [merge(payload,{}), merge(Object.create(null),payload), merge({},payload)]) {
  assert.equal(Object.getPrototypeOf(result),Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(result,'poisoned'),false);
  assert.equal(result.poisoned,undefined);
  assert.equal(result.normal,2);
}
assert.equal({}.poisoned,undefined);
assert.deepEqual(merge({a:{x:1},list:[1]},{a:{y:2},list:[2]}),{a:{x:1,y:2},list:[1,2]});
const key=Symbol('sample');assert.equal(merge({[key]:3},{})[key],3);
console.log('PASS deepmerge security: hostile prototype keys stay data; regular nested/array/symbol merges work.');
