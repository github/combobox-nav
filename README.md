# Combobox Navigation

Attach [combobox navigation behavior (ARIA 1.2)](https://www.w3.org/TR/wai-aria-1.2/#combobox) to `<input>`.

## Installation

```
$ npm install @github/combobox-nav
```

## Usage

### HTML

```html
<label>
  Robot
  <input id="robot-input" type="text">
</label>
<ul role="listbox" id="list-id" hidden>
  <li id="baymax" role="option">Baymax</li>
  <li><del>BB-8</del></li><!-- `role=option` needs to be present for item to be selectable -->
  <li id="hubot" role="option">Hubot</li>
  <li id="r2-d2" role="option">R2-D2</li>
</ul>
```

The combobox navigation pattern does not control list visibility. Please [refer to the ARIA spec](https://www.w3.org/TR/wai-aria-1.2/#combobox) for more requirements around `aria-expanded` and `aria-autocomplete`.

### JS

```js
import {clearSelection, install, navigate, uninstall} from '@github/combobox-nav'
const input = document.querySelector('#robot-input')
const list = document.querySelector('#list-id')

// To install this behavior
install(input, list)
// To move selection to the nth+1 item in the list
navigate(input, list, 1)
// To clear selection
clearSelection(input, list)
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

**⚠ Note:** When using `<label>` + `<input>` as options, please listen on `change` instead of `combobox-commit`.

When a label is clicked on, `click` event is fired from both `<label>` and its associated input `label.control`. Since combobox does not know about the control, `combobox-commit` cannot be used as an indicator of the item's selection state.

## Development

```
npm install
npm test
```
