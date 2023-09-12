
# WebGuy is a Guy for the Web


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy is a Guy for the Web](#webguy-is-a-guy-for-the-web)
  - [`props`](#props)
  - [`time`](#time)
    - [Configuration](#configuration)
    - [Performance Considerations](#performance-considerations)

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

* **`monostamp_s2  = ( count_digits = 3 ) ->`**: return a list containing the result of
  `time.stamp_s()` and a monotonic zero-based, zero-padded counter which will be shared across all
  callers to this method. Sample return value: `[ '1693992062544.423', '000' ]`; should
  `time.stamp_and_count()` get called within the same microsecond, it'd return `[ '1693992062544.423', '001'
  ]` &sf.

### Configuration

```json
cfg =
 count_digits:    3
 counter_joiner:  ':'
 ms_digits:       13
 ms_padder:       '0'
 format:          'milliseconds' # 'compact'
```

* `format`:
  * `milliseconds`: timestamps look like `1693992062544.423:000`
  * `compact`: timestamps look like `1693992062544.423:000`

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
