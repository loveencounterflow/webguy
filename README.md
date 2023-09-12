
# WebGuy is a Guy for the Web


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy is a Guy for the Web](#webguy-is-a-guy-for-the-web)
  - [`props`](#props)
  - [`time`](#time)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->





# WebGuy is a Guy for the Web

## `props`

* **`public_keys = ( owner ) ->`**: return a list of property names, including inherited ones, but excluding
  non-enumerables, symbols, and non-userland ones like `constructor`.

## `time`

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
