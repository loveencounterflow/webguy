



# Guy for the Web

## `props`

* **`public_keys = ( owner ) ->`**: return a list of property names, including inherited ones, but excluding
  non-enumerables, symbols, and non-userland ones like `constructor`.

## `time`

* **`stamp      = -> `** `utc_timestamp = performance.timeOrigin + performance.now()`: return a float
  representing present time as milliseconds elapsed since the Unix epoch (1970-01-01T00:00:00Z), including
  microseconds as a fraction. This is the recommended way to measure time for performance measurements and
  so on, as it is reasonably precise and monotonic (i.e. it is unaffected by system time updates and will
  only ever increase). Here included as a convenience method.

* **`stamp_text = -> `** `@stamp().toFixed 3`: return `time.stamp()` as a string with exactly 3 decimals;
  suitable for IDs, logs &c.

* **`stamp_and_count  = ( count_digits = 3 ) ->`**: return a list containing the result of
  `time.stamp_text()` and a monotonic zero-based, zero-padded counter which will be shared across all
  callers to this method. Sample return value: `[ '1693992062544.423', '000' ]`; should
  `time.stamp_and_count()` get called within the same microsecond, it'd return `[ '1693992062544.423', '001'
  ]` &sf.
