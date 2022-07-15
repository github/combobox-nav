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
  <input id="robot-input" type="text" />
</label>
<ul role="listbox" id="list-id" hidden>
  <li id="baymax" role="option">Baymax</li>
  <li><del>BB-8</del></li>
  <!-- `role=option` needs to be present for item to be selectable -->
  <li id="hubot" role="option">Hubot</li>
  <li id="r2-d2" role="option">R2-D2</li>
</ul>
```

Markup requirements:

- Each option needs to have `role="option"` and a unique `id`
- The list should have `role="listbox"`

### JS

```js
import Combobox from '@github/combobox-nav'
const input = document.querySelector('#robot-input')
const list = document.querySelector('#list-id')

// install combobox pattern on a given input and listbox
const combobox = new Combobox(input, list)
// when options appear, start intercepting keyboard events for navigation
combobox.start()
// when options disappear, stop intercepting keyboard events for navigation
combobox.stop()

// move selection to the nth+1 item in the list
combobox.navigate(1)
// reset selection
combobox.clearSelection()
// uninstall combobox pattern from the input
combobox.destroy()
```

## Events

A bubbling `combobox-commit` event is fired on the list element when an option is selected via keyboard or click.

For example, autocomplete when an option is selected:

```js
list.addEventListener('combobox-commit', function (event) {
  console.log('Element selected: ', event.target)
})
```

> **Note** When using `<label>` + `<input>` as options, please listen on `change` instead of `combobox-commit`.

When a label is clicked on, `click` event is fired from both `<label>` and its associated input `label.control`. Since combobox does not know about the control, `combobox-commit` cannot be used as an indicator of the item's selection state.

## Settings

For advanced configuration, the constructor takes an optional third argument. For example:

```js
const combobox = new Combobox(input, list, {tabInsertsSuggestions: true})
```

These settings are available:

- `tabInsertsSuggestions: boolean = true` - Control whether the highlighted suggestion is inserted when <kbd>Tab</kbd> is pressed (<kbd>Enter</kbd> will always insert a suggestion regardless of this setting). When `true`, tab-navigation will be hijacked when open (which can have negative impacts on accessibility) but the combobox will more closely imitate a native IDE experience.
- `defaultFirstOption: boolean = false` - If no options are selected and the user presses <kbd>Enter</kbd>, should the first item be inserted? If enabled, the default option can be selected and styled with `[data-combobox-option-default]` . This should be styled differently from the `aria-selected` option.
  > **Warning** Screen readers will not announce that the first item is the default. This should be announced explicitly with the use of `aria-live` status text.

## Development

```
npm install
npm test
```
