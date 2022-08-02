import Combobox from '../dist/index.js'

const ctrlBindings = !!navigator.userAgent.match(/Macintosh/)
const supportedInputElements = [
  ['<input type="text">', 'input'],
  ['<textarea></textarea>', 'textarea'],
  ['<div role="textbox" contenteditable></div>', '[role="textbox"][contenteditable]']
]

function press(input, key, ctrlKey) {
  input.dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey}))
}

function click(element) {
  element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
}

describe('combobox-nav', function() {
  for (const [html, selector] of supportedInputElements) {
    describe(`${selector}: with API`, function() {
      let input
      let list
      beforeEach(function() {
        document.body.innerHTML = `
          ${html}
          <ul role="listbox" id="list-id">
            <li id="baymax" role="option">Baymax</li>
            <li id="bb-8"><del>BB-8</del></li>
            <li id="hubot" role="option">Hubot</li>
            <li id="r2-d2" role="option">R2-D2</li>
          </ul>
        `
        input = document.querySelector(selector)
        list = document.querySelector('ul')
      })

      afterEach(function() {
        document.body.innerHTML = ''
      })

      it('installs, starts, navigates, stops, and uninstalls', function () {
        const combobox = new Combobox(input, list)
        assert.equal(input.getAttribute('role'), 'combobox')
        assert.equal(input.getAttribute('aria-expanded'), 'false')
        assert.equal(input.getAttribute('aria-controls'), 'list-id')
        assert.equal(input.getAttribute('aria-autocomplete'), 'list')
        assert.equal(input.getAttribute('aria-haspopup'), 'listbox')

        combobox.start()
        assert.equal(input.getAttribute('aria-expanded'), 'true')

        press(input, 'ArrowDown')
        assert.equal(list.children[0].getAttribute('aria-selected'), 'true')
        combobox.navigate(1)
        assert.equal(list.children[2].getAttribute('aria-selected'), 'true')

        combobox.stop()
        press(input, 'ArrowDown')
        assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')
        assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')

        combobox.destroy()
        assert.equal(list.children[2].getAttribute('aria-selected'), null)

        assert(!input.hasAttribute('role'))
        assert(!input.hasAttribute('aria-expanded'))
        assert(!input.hasAttribute('aria-controls'))
        assert(!input.hasAttribute('aria-autocomplete'))
        assert(!input.hasAttribute('aria-haspopup'))
      })
    })
  }

  describe('with an element that is not an input, textarea, or [contenteditable]', function() {
    let input, list
    beforeEach(function() {
      document.body.innerHTML = `
        <div></div>
        <ul role="listbox" id="list-id"></ul>
      `
      input = document.querySelector('div')
      list = document.querySelector('ul')
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    it('throws an error during construction', function() {
      let error

      try {
        new Combobox(input, list)
      } catch (e) {
        error = e
      }

      assert.ok(error)
      assert.match(error.message, /unsupported/)
    })
  })

  describe('with default setup', function () {
    let input
    let list
    let options
    let combobox
    beforeEach(function () {
      document.body.innerHTML = `
        <input type="text">
        <ul role="listbox" id="list-id">
          <li id="baymax" role="option">Baymax</li>
          <li><del>BB-8</del></li>
          <li id="hubot" role="option">Hubot</li>
          <li id="r2-d2" role="option">R2-D2</li>
          <li id="johnny-5" hidden role="option">Johnny 5</li>
          <li id="wall-e" role="option" aria-disabled="true">Wall-E</li>
          <li><a href="#link" role="option" id="link">Link</a></li>
        </ul>
      `
      input = document.querySelector('input')
      list = document.querySelector('ul')
      options = document.querySelectorAll('[role=option]')
      combobox = new Combobox(input, list)
      combobox.start()
    })

    afterEach(function () {
      combobox.destroy()
      combobox = null
      document.body.innerHTML = ''
    })

    it('updates attributes on keyboard events', function () {
      const expectedTargets = []

      document.addEventListener('combobox-commit', function ({target}) {
        expectedTargets.push(target.id)
      })

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowDown')
      assert.equal(options[1].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')

      ctrlBindings ? press(input, 'n', true) : press(input, 'ArrowDown')
      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'r2-d2')

      ctrlBindings ? press(input, 'n', true) : press(input, 'ArrowDown')
      assert.equal(options[4].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'wall-e')
      press(input, 'Enter')
      click(document.getElementById('wall-e'))

      ctrlBindings ? press(input, 'n', true) : press(input, 'ArrowDown')
      assert.equal(options[5].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'link')

      press(input, 'ArrowDown')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      ctrlBindings ? press(input, 'p', true) : press(input, 'ArrowUp')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')

      press(input, 'ArrowUp')
      assert.equal(options[5].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'link')

      press(input, 'Enter')
      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'link')
    })

    it('fires commit events on click', function () {
      const expectedTargets = []

      document.addEventListener('combobox-commit', function ({target}) {
        expectedTargets.push(target.id)
      })

      click(document.getElementById('hubot'))
      click(document.querySelectorAll('li')[1])
      click(document.getElementById('baymax'))

      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'baymax')
    })

    it('clear selection on input operation', function () {
      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowLeft')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'Control', true)
      assert.equal(options[0].getAttribute('aria-selected'), 'true', 'Selection stays on modifier keydown')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax', 'Selection stays on modifier keydown')

      press(input, 'Backspace')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')
    })

    it('fires event and follows the link on click', function () {
      let eventFired = false
      document.addEventListener('combobox-commit', function () {
        eventFired = true
      })

      click(document.querySelectorAll('[role=option]')[5])
      assert(eventFired)
      assert.equal(window.location.hash, '#link')
    })

    it('clears aria-activedescendant and sets aria-selected=false when cleared', function () {
      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      combobox.clearSelection()

      assert.equal(options[0].getAttribute('aria-selected'), null)
      assert.equal(input.hasAttribute('aria-activedescendant'), false)
    })

    it('scrolls when the selected item is not in view', function () {
      list.style.overflow = 'auto'
      list.style.height = '18px'
      list.style.position = 'relative'
      assert.equal(list.scrollTop, 0)

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')
      assert.equal(list.scrollTop, 0)

      press(input, 'ArrowDown')

      assert.equal(options[1].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')
      assert.equal(list.scrollTop, options[1].offsetTop)
    })
  })

  describe('with defaulting to first option', function () {
    let input
    let list
    let options
    let combobox
    beforeEach(function () {
      document.body.innerHTML = `
        <input type="text">
        <ul role="listbox" id="list-id">
          <li id="baymax" role="option">Baymax</li>
          <li><del>BB-8</del></li>
          <li id="hubot" role="option">Hubot</li>
          <li id="r2-d2" role="option">R2-D2</li>
          <li id="johnny-5" hidden role="option">Johnny 5</li>
          <li id="wall-e" role="option" aria-disabled="true">Wall-E</li>
          <li><a href="#link" role="option" id="link">Link</a></li>
        </ul>
      `
      input = document.querySelector('input')
      list = document.querySelector('ul')
      options = document.querySelectorAll('[role=option]')
      combobox = new Combobox(input, list, {defaultFirstOption: true})
      combobox.start()
    })

    afterEach(function () {
      combobox.destroy()
      combobox = null
      document.body.innerHTML = ''
    })

    it('indicates first option when started', () => {
      assert.equal(document.querySelector('[data-combobox-option-default]'), options[0])
      assert.equal(document.querySelectorAll('[data-combobox-option-default]').length, 1)
    })

    it('indicates first option when restarted', () => {
      combobox.stop()
      combobox.start()
      assert.equal(document.querySelector('[data-combobox-option-default]'), options[0])
    })

    it('applies default option on Enter', () => {
      let commits = 0
      document.addEventListener('combobox-commit', () => commits++)

      assert.equal(commits, 0)
      press(input, 'Enter')
      assert.equal(commits, 1)
    })

    it('clears default indication when navigating', () => {
      combobox.navigate(1)
      assert.equal(document.querySelectorAll('[data-combobox-option-default]').length, 0)
    })

    it('resets default indication when selection cleared', () => {
      combobox.navigate(1)
      combobox.clearSelection()
      assert.equal(document.querySelectorAll('[data-combobox-option-default]').length, 1)
    })

    it('does not error when no options are visible', () => {
      assert.doesNotThrow(() => {
        document.getElementById('list-id').style.display = 'none'
        combobox.clearSelection()
      })
    })
  })
})
