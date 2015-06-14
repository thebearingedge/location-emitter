# location-emitter

An observable facade for interacting with the browser path.

```bash
npm install location-emitter
```

During construction `location-emitter` will detect if `history.pushState` is available and fall back to using `location.hash`.

# example

```javascript
var domready = require('domready');
var LocationEmitter = require('location-emitter');

var le = new LocationEmitter();

le.onChange(function (path) {
  console.log(path);
});

domready(function () {
  // start
  le.listen(); // -> log current path, e.g. "/"
  le.url('/foo'); // -> log "/foo"
  le.hash('bar'); // -> log "/foo#bar"
});
```

# constructor

```javascript
var LocationEmitter = require('location-emitter');

var location = new LocationEmitter();
```

`pushState` is opt-out. Force the use of hashes by passing an option.

```javascript
var location = new LocationEmitter({ html5: false });
```

# methods

`location-emitter` has some simple functions for interacting with the browser path.

## location.url([path])

```javascript
location.url('/foo'); // -> sets path or hash to "/foo";

location.url(); // -> "/foo"
```

## location.hash([hash])

You may want to interact with the hash directly.

```javascript
location.hash('hashy-hashy'); // -> hash is now "#hashy-hashy"

location.hash(); // -> "hashy-hashy"
```

## location.replace([path])

Replace the current browser history entry. Uses `history.replaceState` unless it's unavailable or `html5` was set to false;

```javascript
var location = new LocationEmitter();
location.replace('/') // -> replace history entry with "/"

var location = new LocationEmitter({ html5: false });
location.replace('/') // -> replace history entry with "/#/"
```

## location.onChange(listener) -> unsubscribe

Adds `listener` functions to handle path changes. Returns an `unsubscribe` function.

```javascript
var stopCaring = location.onChange(function (path) {
  // that's a cool path!... maybe.
});

stopCaring(); // -> meh.
```

## location.listen()

Subscribers are not notified of path changes until `location-emitter` is listening to the DOM. **Note:** You'll want to make sure the DOM is ready before calling `listen`.

```javascript
location.listen(); // -> Notify all subscribers of current and future paths
```
