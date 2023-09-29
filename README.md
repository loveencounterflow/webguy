
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
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





# WebGuy is a Guy for the Web

## `props`

* **`public_keys = ( owner ) ->`**: return a list of property names, including inherited ones, but excluding
  non-enumerables, symbols, and non-userland ones like `constructor`.

## `time`

`WEBGUY.time` contains facilities to create timestamps for purposes like logging or to create dated DB records.

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

## To Do

* **`[–]`** `types.isa.sized()`, `types.isa.iterable()` test for 'existence' of `x` (`x?`) but must test for
  non-objects as well or catch exception (better)
* **`[–]`** define what `iterable` and `container` are to mean precisely, as in, provide the defining
  characteristic. Somehow we can e.g. iterate over a string as in `x for x in 'abc'` and `d = [ 'abc'..., ]`
  but `Reflect.has 'abc', Symbol.iterator` still fails with an exception ('called on non-object').
