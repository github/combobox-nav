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

A bubbling `combobox-select` event is fired on the list element when an option is selected but not yet committed.

For example, autocomplete when an option is selected but not yet committed:

```js
list.addEventListener('combobox-select', function (event) {
  console.log('Element selected : ', event.target)
})
```

## Settings

For advanced configuration, the constructor takes an optional third argument. For example:

```js
const combobox = new Combobox(input, list, {tabInsertsSuggestions: true})
```

These settings are available:

- `tabInsertsSuggestions: boolean = true` - Control whether the highlighted suggestion is inserted when <kbd>Tab</kbd> is pressed (<kbd>Enter</kbd> will always insert a suggestion regardless of this setting). When `true`, tab-navigation will be hijacked when open (which can have negative impacts on accessibility) but the combobox will more closely imitate a native IDE experience.
- `firstOptionSelectionMode: FirstOptionSelectionMode = 'none'` - This option dictates the default behaviour when no options have been selected yet and the user presses <kbd>Enter</kbd>. The following values of `FirstOptionSelectionMode` will do the following:
   - `'none'`: Don't auto-select the first option at all.
   - `'active'`: Place the first option in an 'active' state where it is not selected (is not the `aria-activedescendant`) but will still be applied if the user presses `Enter`. To select the second item, the user would need to press the down arrow twice. This approach allows quick application of selections without disrupting screen reader users.
   > **Warning** Screen readers will not announce that the first item is the default. This should be announced explicitly with the use of `aria-live` status 
   - `'selected'`: Select the first item by navigating to it. This allows quick application of selections and makes it faster to select the second item, but can be disruptive or confusing for screen reader users.
- `scrollIntoViewOptions?: boolean | ScrollIntoViewOptions = undefined` - When
  controlling the element marked `[aria-selected="true"]` with keyboard navigation, the selected element will be scrolled into the viewport by a call to [Element.scrollIntoView][]. Configure this value to control the scrolling behavior (either with a `boolean` or a [ScrollIntoViewOptions][] object.

[Element.scrollIntoView]: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
[ScrollIntoViewOptions]: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#sect1


## Development

```
npm install
npm test
```
