
# WebGuy is a Guy for the Web


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy is a Guy for the Web](#webguy-is-a-guy-for-the-web)
  - [`props`](#props)
  - [`time`](#time)
    - [Configuration](#configuration)
    - [Performance Considerations](#performance-considerations)
  - [`environment`](#environment)
  - [`trm`](#trm)
  - [`types`](#types)
    - [API](#api)
    - [Type Signatures](#type-signatures)
  - [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





# WebGuy is a Guy for the Web

## `props`

* **`public_keys = ( owner ) ->`**: return a list of property names, including inherited ones, but excluding
  non-enumerables, symbols, and non-userland ones like `constructor`.

* **`get_prototype_chain = ( x ) ->`**: return a list containing object `x` and all the objects encountered
  when walking down `x`'s' prototype chain (using `Object.getPrototypeOf()` repeatedly). If `x` is `null` or
  `undefined`, return an empty list because in that case there are zero objects where property lookup could
  happen. The `reverse()`d prototype chain is used by the two `*depth_first*()` method, below.

* **`walk_depth_first_property_descriptors = ( x ) ->`**: Given a value `x`, return an iterator

* **`acquire_depth_first = ( source, cfg ) ->`**: given a `source` object, walk the property chain from the
  bottom to the top (using `walk_depth_first_property_descriptors()`) and transfer all properties to a new
  or a given `target` object. This is most useful when used with a `filter` to select, a `generator`
  function to generate new, and&nbsp;/ or a `decorator` to modify accepted and generated properties.
  `acquire_depth_first()` will keep the relative ordering: **(1)** 'top-down' for each object (properties
  declared earlier will appear, on the target, before ones declared later); **(2)** w.r.t. inheritance in
  the sense that the prototype of a given object `x` in the prototype chain will be looked at *before*
  properties on `x` itself is considered. Later properties *may* shadow (replace) earlier ones but it's also
  possible to forbid shadowing or ignore it altogether (see `overwrite`, below).

  When a `cfg` object is given as second arguments, it may have the below settings, all of which are
  optional:

  * **`filter`**: An optional function that will be called with an object `{ target, owner, key, descriptor,
    }` for **(1)** each found property; it should return either `true` (to keep the property) or `false` (to
    skip the property); non-Boolean return values will cause an error.

  * **`decorator`**: An optional function that will be called with an object `{ target, owner, key,
    descriptor, }` for **(1)** each found property and **(2)** each generated property, too.

  * **`descriptor`**: An optional object containing updates to each property's descriptor. Use e.g.
    `descriptor: { enumerate: true, }` in the call to `acquire_depth_first()` to ensure that all acquired
    properties on the `target` object will be enumerable.

  * **`target`**: the object to which the properties are to be assigned to. If not given, a new empty object
    `{}` will be used.

  * **`overwrite`**: controls how to deal with property keys that appear more than once in the prototype
    chain. Since `acquire_depth_first()`'s raison d'être is doing depth-first 'anti-inheritance', there are
    several ways to deal with repeated properties, as the case may be:
    * **`false`** (default): Throw an error when an overriding key is detected
    * **`true`**: Later key / value pairs (that are closer to the source value) override earlier ones,
      resulting in a key resolution that is like inheritance (but without the possibility to access a
      shadowed value).
    * **`'ignore'`**: Silently ignore later keys that are already set; only the first mention of a key /
      value pair is retained.

  * **`generate`**: if given, must be a generator function `gf()` (a function using the `yield` keyword).
    The generator function will be called with an object `{ target, owner, key, descriptor, }` for each
    property found and is expected to yield any number of values of the format `{ key, descriptor, }`.
    `gf()` will only be called if the property has not been not `filter`ed out. Yielded keys and descriptors
    will be used to call `decorator` if that is set.

    **Points to keep in mind**:

    * The most trivial setting for `generate`, a generator that doesn't yield anything—`( d ) -> yield
      return null`; JS: `function*( d ) { return null; }`—has the effect of preventing any property to be
      set on the target. This is because the original key / value pair is not treated specially in any way,
      so the user can (and must) freely decide whether and where they want the original property to appear
      in the target.
    * Take care not to re-use the `descriptor` that was passed in without copying it. Instead, always use
      syntax like yield `{ key: 'foo', descriptor: { descriptor..., value: foo, } }` to prevent leakage of
      (most importantly) the `value` from one property to another.

## `time`

`WEBGUY.time` contains facilities to create timestamps for purposes like logging or to create dated DB
records.

Timestamps are one of those things that seem easy (like, `+new Date()` or `Date.now()`) but get quite a bit
harder when you bring in typical constraints. One wants one's timestamps to be:

* **precise**: Computers are fast and a millisecond is sort of a long time for a CPU. Naïve JS timestamps
  only have millisecond precision, so one can easily end up with two consecutive timestamps that are equal.
  This leads to

* **monotonous**: You don't want your timestamps to ever 'stand still' or, worse, decrement and repeat at
  any point in time. Because `new Date()` is tied to civil time, they are not guaranteed to do that.

* **relatable**: Ideally, you want your timestamps to tell you when something happened. A 13-digit number
  can do that—in theory. In practice, only some nerds can reliably tell the difference between timestamps
  from today and those from last week or last year.

* **durable**: Time-keeping is complicated: Timezones are introduced and abolished, daylight saving dates
  can vary within a single country and may get cancelled in some years or split into two separate durations
  within a year; some people count years *ab urbe condita*, some days since CE&nbsp;1900, some seconds and
  others milliseconds from CE&nbsp;1970; in some years, you get a leap second and so on. For these reasons,
  local civil time is *not* a good choice for timestamps.

* Suffixes:
  * methods ending in `f` return **f**loats,
  * methods ending in `s` return **s**trings;
  * methods ending in `1` return a single value, contrasted with
  * methods ending in `2` which return a list of two values.

* **`stamp_f = -> `** `utc_timestamp = performance.timeOrigin + performance.now()`: return a float
  representing present time as milliseconds elapsed since the Unix epoch (1970-01-01T00:00:00Z), including
  microseconds as a fraction. This is the recommended way to measure time for performance measurements and
  so on, as it is reasonably precise and monotonic (i.e. it is unaffected by system time updates and will
  only ever increase). Here included as a convenience method.

* **`stamp_s = ( stamp_s = null  ) -> `** `( stamp_s ? @stamp_f() ).toFixed 3`: return the numeric timestamp
  or `time.stamp_f()` as a string with exactly 3 decimals; suitable for IDs, logs &c.

* **`monostamp_f2 = ->`**: return a list containing the result of

* **`monostamp_s2  = ( stamp_f = null, count = null ) ->`**: return a list containing the result of
  `time.stamp_s()` and a monotonic zero-based, zero-padded counter which will be shared across all callers
  to this method. Sample return value: `[ '1693992062544.423', '000' ]`; should `time.stamp_and_count()` get
  called within the same microsecond, it'd return `[ '1693992062544.423', '001' ]` &sf. Especially for
  testing purposes, one can pass in the fractional timestamp and a value for the counter.

* **`monostamp_s1  = ( stamp_f = null, count = null ) ->`**: return the same as `monostamp_s2()`, but
  concatenated using `cfg.counter_joiner`.

* **`stamp()`** is a convenience equivalent to `monostamp_s1()`.


### Configuration

```coffeescript
cfg =
 count_digits:    3     # how many digits to use for counter
 counter_joiner:  ':'   # comes between timestamp and counter
 ms_digits:       13    # thirteen digits should be enough for anyone (until November 2286)
 ms_padder:       '0'   # padding for short timestamps (before 2001)
 format:          'iso' # should be 'iso', or 'milliseconds', or custom format
```

* `format`:
  * `milliseconds`: timestamps look like `1693992062544.423:000`
  * `iso`: timestamps look like `1970-01-01T00:00:00.456789Z:000`
  * `compact`: timestamps look like `19700101000000456789:000`
  * `dense`: timestamps look like `19700101@000000.456789:000` for readability
  * any other string will be interpreted by [the `format()` method of
    `dayjs`](https://day.js.org/docs/en/display/format), with the addition of `µ` U+00b5 Micro Sign, which
    symbolizes 6 digits for the microseconds part. A minimal template that doesn't leave out any vital data
    and still sorts correctly is `YYYYMMDDHHmmssµ`, which produces `compact` format timestamps like
    `20230913090909275140:000` (the counter being implicitly added).

### Performance Considerations

A quick test convinced me that I'm getting around 170 calls to `time.monostamp_s1()` into a single
millisecond; these timestamps then look like

```
1694515874596.967:000
1694515874596.976:000
1694515874596.981:000
1694515874596.990:000
1694515874596.995:000
```

— that is, a repetition in the tens and hundredths of milliseconds is quite likely, but a repetition in the
thhousandths of milliseconds (i.e. microseconds) is unlikely. It's a rare event (estimated to less than one
in a million) that the counter ever goes up to even one. This tells me that on my (not up-market, not fast)
laptop it should be more than safe to use three digits for the counter; however that may not be true for
faster machines.


<!--

methods stop(), start() to keep current time (but not counter)

 -->

## `environment`

`( require 'webguy' ).environment` is an object like `{ browser: false, node: true, webworker: false, jsdom:
false, deno: false, name: 'node', }` with boolean and one text properties that tell you in what kind of
environment the code is running. Observe that there may be environments where no boolean property is `true`
and `name` is `null`.

## `trm`

* **`rpr = ( x ) ->`**: return a formatted textual representation of any value `x`.

## `types`

### API

* `validate.t x, ...`—returns `true` on success, throws error otherwise
* `isa.t      x, ...`—returns `true` on success, `false` otherwise


### Type Signatures

* string of variable length reflecting the results of a minimal number of tests that never fail and
  give each type of values a unique name

* Tests are:
  * the result of `typeof x`
  * the shortened *Miller Device Name* (MDN) obtained by `Object::toString.call x`, but replacing the
    surrounding (and invariably constant) `[object (.*)]`
  * the value's `constructor.name` property or `0` where missing
  * the value's *Denicola Device Name* (DDN), which is the `constructor` property's `name` or, if the value
    has no prototype, the digit zero `0`.
  * the value's *Carter Device Name* (CDN), which is `class` for ES6 `class`es, `fn` for functions, and
    `other` for everything else. It works by first looking at a value's Miller Device Name; if that is not
    indicative of a function, the value's CDN is `other`. Else, the property descriptor `dsc` of the value's
    prototype is retrieved; if it is missing, the CDN is `other`, too. If `dsc.writable` is `true`, the CDN
    is `fn`; otherwise, the CDN is `class`.
  * `N` if `Number.isNaN x` is `true`, digit zero `0` otherwise

Results are joined with a slash `/`.

**### TAINT test for class instances?**

```coffeescript
( typeof x )
( x?.constructor.name ? '-' )
( Number.isNaN x ) ].join '/'

( ( Object::toString.call x ).replace /^\[object (.+?)\]$/u, '$1' )
( x?.constructor.name ? '0' )
( if Number.isNaN x then 'N' else '-' )
###

xxx The [Carter Device (by one Ian Carter, 2021-09-24)](https://stackoverflow.com/a/69316645/7568091) for
those values whose Miller Device Name is `[object Function]`:

Also see [this detailed answer in the same discussion](https://stackoverflow.com/a/72326559/7568091).

[Link to specs](https://tc39.es/ecma262/#sec-runtime-semantics-classdefinitionevaluation)

###
get_carter_device_name = ( x, miller_device_name = null ) ->
  miller_device_name ?= Object::toString.call x
  return '-'  unless miller_device_name is '[object Function]'
  return 'fn' unless ( descriptor = Object.getOwnPropertyDescriptor x, 'prototype' )?
  return 'fn' if descriptor.writable
  return 'class'
console.log '^4234-1^', isa_class ( class D )
console.log '^4234-2^', isa_class ( -> )
f = -> new Promise ( resolve , reject ) ->
  console.log '^4234-3^', isa_class resolve
  console.log '^4234-4^', isa_class reject
  console.log '^4234-5^', Object.getOwnPropertyDescriptor resolve, 'prototype'
  resolve null
await f()
###
https://stackoverflow.com/a/69316645/7568091 (2021-09-24 Ian Carter)
https://stackoverflow.com/a/72326559/7568091
coffee> ( Object.getOwnPropertyDescriptor d, 'prototype' )?.writable ? false
{ value: {}, writable: false, enumerable: false, configurable: false }
coffee> Object.getOwnPropertyDescriptor (->), 'prototype'
{ value: {}, writable: true, enumerable: false, configurable: false }
###
```

## To Do

* **`[–]`** `types.isa.sized()`, `types.isa.iterable()` test for 'existence' of `x` (`x?`) but must test for
  non-objects as well or catch exception (better)
* **`[–]`** define what `iterable` and `container` are to mean precisely, as in, provide the defining
  characteristic. Somehow we can e.g. iterate over a string as in `x for x in 'abc'` and `d = [ 'abc'..., ]`
  but `Reflect.has 'abc', Symbol.iterator` still fails with an exception ('called on non-object').
  * **`[–]`** In the same vein, what exactly is an `object` in JS? Maybe indeed anything that is not a
    primitive value (i.e. not `null`, `undefined`, `true`, `false`, number including `Infinity` and `NaN`
    (but not `BigInt`)). As such, maybe `primitive`, `nonprimitive` would be OK?
    * Maybe any `d` for which `[ ( typeof d ), ( Object::toString.call d ), ( d instanceof Object ), ]`
      gives `[ 'object', '[object Array]', true ]`. This would *include* instances of a plain `class O;`
      which are implicitly (but somehow different from explicitly?) derived from `Object`. One could throw
      the [Dominic Denicola Device](https://stackoverflow.com/users/3191/domenic) i.e. `d.constructor.name`
      into the mix which would then *exclude* instances of `class O;`.
* **`[–]`** `WEBGUY.types.declare`: consider to prohibit adding, removing types from the default export
  instance as it may be considered too brittle: declaring a type can potentially change results of
  `type_of`, too, so even consumers that do not make use of the new type could be affected. A dependent
  module may or may not see the same instance of `WEBGUY.types`, depending on their precise dependency
  declarations *and* depending on the package manager used.
* **`[–]`** implement in `WEBGUY.errors` custom error classes with refs, use them in `WEBGUY.types`
* **`[–]`** disallow overrides by default when `extend`ing class `Isa` to avoid surprising behavior (might
  want to implement with set of type names; every repetition is an error unless licensed)
  * **`[–]`** might later want to allow overrides not for entire instance but per type by adding parameter
    to declaration object
* **`[–]`** in `props.acquire_depth_first()`, do not silently overwrite earlier properties with later ones;
  instead, use `cfg.overwrite` to determine what should happen (`true` overwrites, function calls back,
  `false` throw an error).
* **`[–]`** in `props.acquire_depth_first()`, add `cfg.generate()` (?) option to allow generation of any
  number of additional members in addition to seen ones. This should be called before `cfg.decorator()` gets
  called. Should probably require `cfg.generate()` to be a generator function.

## Is Done

* **`[+]`** <del>in the `Isa` standard types, should e.g. `integer` only refer to integer floats (`4.0`) or
  to floats and `BigInt`s (`4.0` and `4n`)? Could / should that be configurable?</del> <ins>remove all
  mentions of `BigInt`s in `isa` tests with a view to establish separate types for them in the future
  (`bigint`, `zero_bigint` &c)
* **`[+]`** in `types.validate`, return input value such that `x is types.validate.whatever x` is always
  satisfied unless `x` doesn't validate
