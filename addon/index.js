import Ember from 'ember';

var get = Ember.get;
var set = Ember.set;

/**
  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered. You
  can create a set to efficiently test for membership for an object. You can
  also iterate through a set just like an array, even accessing objects by
  index, however there is no guarantee as to their order.

  All Sets are observable via the Enumerable Observer API - which works
  on any enumerable object including both Sets and Arrays.

  ## Creating a Set

  You can create a set like you would most objects using
  `new Ember.Set()`. Most new sets you create will be empty, but you can
  also initialize the set with some content by passing an array or other
  enumerable of objects to the constructor.

  Finally, you can pass in an existing set and the set will be copied. You
  can also create a copy of a set by calling `Ember.Set#copy()`.

  ```javascript
  // creates a new empty set
  var foundNames = new Ember.Set();

  // creates a set with four names in it.
  var names = new Ember.Set(["Charles", "Tom", "Juan", "Alex"]); // :P

  // creates a copy of the names set.
  var namesCopy = new Ember.Set(names);

  // same as above.
  var anotherNamesCopy = names.copy();
  ```

  ## Adding/Removing Objects

  You generally add or remove objects from a set using `add()` or
  `remove()`. You can add any type of object including primitives such as
  numbers, strings, and booleans.

  Unlike arrays, objects can only exist one time in a set. If you call `add()`
  on a set with the same object multiple times, the object will only be added
  once. Likewise, calling `remove()` with the same object multiple times will
  remove the object the first time and have no effect on future calls until
  you add the object to the set again.

  NOTE: You cannot add/remove `null` or `undefined` to a set. Any attempt to do
  so will be ignored.

  In addition to add/remove you can also call `push()`/`pop()`. Push behaves
  just like `add()` but `pop()`, unlike `remove()` will pick an arbitrary
  object, remove it and return it. This is a good way to use a set as a job
  queue when you don't care which order the jobs are executed in.

  ## Testing for an Object

  To test for an object's presence in a set you simply call
  `Ember.Set#contains()`.

  ## Observing changes

  When using `Ember.Set`, you can observe the `"[]"` property to be
  alerted whenever the content changes. You can also add an enumerable
  observer to the set to be notified of specific objects that are added and
  removed from the set. See [Ember.Enumerable](/api/classes/Ember.Enumerable.html)
  for more information on enumerables.

  This is often unhelpful. If you are filtering sets of objects, for instance,
  it is very inefficient to re-filter all of the items each time the set
  changes. It would be better if you could just adjust the filtered set based
  on what was changed on the original set. The same issue applies to merging
  sets, as well.

  ## Other Methods

  `Ember.Set` primary implements other mixin APIs. For a complete reference
  on the methods you will use with `Ember.Set`, please consult these mixins.
  The most useful ones will be `Ember.Enumerable` and
  `Ember.MutableEnumerable` which implement most of the common iterator
  methods you are used to on Array.

  Note that you can also use the `Ember.Copyable` and `Ember.Freezable`
  APIs on `Ember.Set` as well. Once a set is frozen it can no longer be
  modified. The benefit of this is that when you call `frozenCopy()` on it,
  Ember will avoid making copies of the set. This allows you to write
  code that can know with certainty when the underlying set data will or
  will not be modified.

  @class Set
  @namespace Ember
  @extends Ember.CoreObject
  @uses Ember.MutableEnumerable
  @uses Ember.Copyable
  @uses Ember.Freezable
  @since Ember 0.9
*/
export default Ember.CoreObject.extend(Ember.MutableEnumerable, Ember.Copyable, Ember.Freezable, {

  _content: new Set(),

  // ..........................................................
  // IMPLEMENT ENUMERABLE APIS
  //

  /**
    This property will change as the number of objects in the set changes.

    @property length
    @type number
    @default 0
  */
  length: 0,

  /**
    Clears the set. This is useful if you want to reuse an existing set
    without having to recreate it.

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.length;  // 3
    colors.clear();
    colors.length;  // 0
    ```

    @method clear
    @return {Ember.Set} An empty Set
  */
  clear: function() {
    if (this.isFrozen) { throw new Ember.EmberError(Ember.FROZEN_ERROR); }

    var len = get(this, 'length');
    if (len === 0) { return this; }

    var guid;

    this.enumerableContentWillChange(len, 0);

    this._content.clear();

    // for (var i=0; i < len; i++) {
    //   guid = guidFor(this[i]);
    //   delete this[guid];
    //   delete this[i];
    // }

    set(this, 'length', 0);

    this.enumerableContentDidChange(len, 0);

    return this;
  },

  /**
    Returns true if the passed object is also an enumerable that contains the
    same objects as the receiver.

    ```javascript
    var colors = ["red", "green", "blue"],
        same_colors = new Ember.Set(colors);

    same_colors.isEqual(colors);               // true
    same_colors.isEqual(["purple", "brown"]);  // false
    ```

    @method isEqual
    @param {Ember.Set} obj the other object.
    @return {Boolean}
  */
  isEqual: function(obj) {
    // fail fast - other object does not mix in ember enumerable
    if (!Ember.Enumerable.detect(obj)) return false;

    var loc = get(this, 'length');
    if (get(obj, 'length') !== loc) return false;

    var setIter = this._content.values();
    while(--loc >= 0) {
      if (!obj.contains(setIter.next().value)) return false;
    }

    return true;
  },

  /**
    Adds an object to the set. Only non-`null` objects can be added to a set
    and those can only be added once. If the object is already in the set or
    the passed value is null this method will have no effect.

    This is an alias for `Ember.MutableEnumerable.addObject()`.

    ```javascript
    var colors = new Ember.Set();
    colors.add("blue");     // ["blue"]
    colors.add("blue");     // ["blue"]
    colors.add("red");      // ["blue", "red"]
    colors.add(null);       // ["blue", "red"]
    colors.add(undefined);  // ["blue", "red"]
    ```

    @method add
    @param {Object} obj The object to add.
    @return {Ember.Set} The set itself.
  */
  add: Ember.aliasMethod('addObject'),

  /**
    Removes the object from the set if it is found. If you pass a `null` value
    or an object that is already not in the set, this method will have no
    effect. This is an alias for `Ember.MutableEnumerable.removeObject()`.

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.remove("red");     // ["blue", "green"]
    colors.remove("purple");  // ["blue", "green"]
    colors.remove(null);      // ["blue", "green"]
    ```

    @method remove
    @param {Object} obj The object to remove
    @return {Ember.Set} The set itself.
  */
  remove: Ember.aliasMethod('removeObject'),

  /**
    Removes the last element from the set and returns it, or `null` if it's empty.

    ```javascript
    var colors = new Ember.Set(["green", "blue"]);
    colors.pop();  // "blue"
    colors.pop();  // "green"
    colors.pop();  // null
    ```

    @method pop
    @return {Object} The removed object from the set or null.
  */
  pop: function() {
    if (get(this, 'isFrozen')) throw new Ember.EmberError(Ember.FROZEN_ERROR);
    var obj = this._content.values().next();
    if (obj.done) {
      return null;
    }
    this.remove(obj.value);
    return obj.value;
  },

  /**
    Inserts the given object on to the end of the set. It returns
    the set itself.

    This is an alias for `Ember.MutableEnumerable.addObject()`.

    ```javascript
    var colors = new Ember.Set();
    colors.push("red");   // ["red"]
    colors.push("green"); // ["red", "green"]
    colors.push("blue");  // ["red", "green", "blue"]
    ```

    @method push
    @return {Ember.Set} The set itself.
  */
  push: Ember.aliasMethod('addObject'),

  /**
    Removes the last element from the set and returns it, or `null` if it's empty.

    This is an alias for `Ember.Set.pop()`.

    ```javascript
    var colors = new Ember.Set(["green", "blue"]);
    colors.shift();  // "blue"
    colors.shift();  // "green"
    colors.shift();  // null
    ```

    @method shift
    @return {Object} The removed object from the set or null.
  */
  shift: Ember.aliasMethod('pop'),

  /**
    Inserts the given object on to the end of the set. It returns
    the set itself.

    This is an alias of `Ember.Set.push()`

    ```javascript
    var colors = new Ember.Set();
    colors.unshift("red");    // ["red"]
    colors.unshift("green");  // ["red", "green"]
    colors.unshift("blue");   // ["red", "green", "blue"]
    ```

    @method unshift
    @return {Ember.Set} The set itself.
  */
  unshift: Ember.aliasMethod('push'),

  /**
    Adds each object in the passed enumerable to the set.

    This is an alias of `Ember.MutableEnumerable.addObjects()`

    ```javascript
    var colors = new Ember.Set();
    colors.addEach(["red", "green", "blue"]);  // ["red", "green", "blue"]
    ```

    @method addEach
    @param {Ember.Enumerable} objects the objects to add.
    @return {Ember.Set} The set itself.
  */
  addEach: Ember.aliasMethod('addObjects'),

  /**
    Removes each object in the passed enumerable to the set.

    This is an alias of `Ember.MutableEnumerable.removeObjects()`

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.removeEach(["red", "blue"]);  //  ["green"]
    ```

    @method removeEach
    @param {Ember.Enumerable} objects the objects to remove.
    @return {Ember.Set} The set itself.
  */
  removeEach: Ember.aliasMethod('removeObjects'),

  // ..........................................................
  // PRIVATE ENUMERABLE SUPPORT
  //

  init: function(items) {
    this._content = new Set();
    this._super();
    if (items) this.addObjects(items);
  },

  // implement Ember.Enumerable
  nextObject: function(idx, prevObj, ctx) {
    if (idx === 0) {
      ctx.setIter = this._content.values();
    }
    return ctx.setIter.next().value;
  },

  // implements Ember.MutableEnumerable
  addObject: function(obj) {
    if (get(this, 'isFrozen')) throw new Ember.EmberError(Ember.FROZEN_ERROR);
    if (Ember.isNone(obj)) return this; // nothing to do

    if (this._content.has(obj)) return this;

    var len  = get(this, 'length');
    var added = [obj];

    this.enumerableContentWillChange(null, added);

    this._content.add(obj);
    set(this, 'length', len+1);

    this.enumerableContentDidChange(null, added);

    return this;
  },

  // implements Ember.MutableEnumerable
  removeObject: function(obj) {
    if (get(this, 'isFrozen')) throw new Ember.EmberError(Ember.FROZEN_ERROR);
    if (Ember.isNone(obj)) return this; // nothing to do

    if (!this._content.has(obj)) return this;

    var len = get(this, 'length');
    var removed = [obj];

    this.enumerableContentWillChange(removed, null);

    this._content.delete(obj);
    set(this, 'length', len-1);

    this.enumerableContentDidChange(removed, null);

    return this;
  },

  // optimized version
  contains: function(obj) {
    return this._content.has(obj);
  },

  copy: function() {
    var C = this.constructor, ret = new C(), loc = get(this, 'length');
    set(ret, 'length', loc);
    ret._content = new Set(this._content);
    return ret;
  },

  toString: function() {
    var array = [];
    this._content.forEach(function(val) {
      array.push(val);
    });
    return Ember.String.fmt("Ember.SetPolyfill<%@>", [array.join(',')]);
  }
});
