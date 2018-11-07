# Combobox Navigation

Attach [combobox navigation behavior](https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html) to `<input>` or `<textarea>`.

## Installation

```
$ npm install @github/combobox-nav
```

## Usage

### HTML

```html
<label>
  Robot
  <input id="robot-input" aria-owns="list-id" role="combobox" type="text">
</label>
<ul role="listbox" id="list-id">
  <li id="baymax" role="option">Baymax</li>
  <li><del>BB-8</del></li><!-- `role=option` needs to be present for item to be selectable -->
  <li id="hubot" role="option">Hubot</li>
  <li id="r2-d2" role="option">R2-D2</li>
</ul>
```

### JS

```js
import {install, navigate, uninstall} from '@github/combobox-nav'
const input = document.querySelector('#robot-input')
const list = document.querySelector('#list-id')

// To install this behavior
install(input, list)
// To move selection to the nth+1 item in the list
navigate(input, list, 1)
// To uninstall this behavior
uninstall(input, list)
```

## Events

A bubbling `combobox-commit` event is fired on the list element when an option is selected via keyboard or click.

For example, autocomplete when an option is selected:

```js
list.addEventListener('combobox-commit', function(event) {
  console.log('Element selected: ', event.target)
})
```

## Development

```
npm install
npm test
```
