import Combobox from '../dist/index.js'
function press(input, key, ctrlKey) {
  input.dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey}))
}

function click(element) {
  element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
}

describe('combobox-nav', function() {
  describe('with API', function() {
    let input, list
    beforeEach(function() {
      document.body.innerHTML = `
        <input type="text">
        <ul role="listbox" id="list-id">
          <li id="baymax" role="option">Baymax</li>
          <li id="bb-8"><del>BB-8</del></li>
          <li id="hubot" role="option">Hubot</li>
          <li id="r2-d2" role="option">R2-D2</li>
        </ul>
      `
      input = document.querySelector('input')
      list = document.querySelector('ul')
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('installs, starts, navigates, stops, and uninstalls', function() {
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
      assert.equal(list.children[2].getAttribute('aria-selected'), 'true')

      combobox.destroy()
      assert.equal(list.children[2].getAttribute('aria-selected'), 'false')

      assert(!input.hasAttribute('role'))
      assert(!input.hasAttribute('aria-expanded'))
      assert(!input.hasAttribute('aria-controls'))
      assert(!input.hasAttribute('aria-autocomplete'))
      assert(!input.hasAttribute('aria-haspopup'))
    })
  })

  describe('with default setup', function() {
    let input, list, options, combobox
    beforeEach(function() {
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

    afterEach(function() {
      combobox.destroy()
      combobox = null
      document.body.innerHTML = ''
    })

    it('updates attributes on keyboard events', function() {
      const expectedTargets = []

      document.addEventListener('combobox-commit', function({target}) {
        expectedTargets.push(target.id)
      })

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowDown')
      assert.equal(options[1].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')

      press(input, 'ArrowDown')
      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'r2-d2')

      press(input, 'ArrowDown')
      assert.equal(options[4].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'wall-e')
      press(input, 'Enter')
      click(document.getElementById('wall-e'))

      press(input, 'ArrowDown')
      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowUp')
      assert.equal(options[5].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'link')

      press(input, 'ArrowDown')
      press(input, 'ArrowDown')
      assert.equal(options[1].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')
      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'hubot')
    })

    it('fires commit events on click', function() {
      const expectedTargets = []

      document.addEventListener('combobox-commit', function({target}) {
        expectedTargets.push(target.id)
      })

      click(document.getElementById('hubot'))
      click(document.querySelectorAll('li')[1])
      click(document.getElementById('baymax'))

      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'baymax')
    })

    it('clear selection on input operation', function() {
      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowLeft')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'Backspace')
      assert(!list.querySelector('[aria-selected=true]'), 'Nothing should be selected')
      assert(!input.hasAttribute('aria-activedescendant'), 'Nothing should be selected')
    })

    it('fires event and follows the link on click', function() {
      let eventFired = false
      document.addEventListener('combobox-commit', function() {
        eventFired = true
      })

      click(document.querySelectorAll('[role=option]')[5])
      assert(eventFired)
      assert.equal(window.location.hash, '#link')
    })

    it('clears aria-activedescendant and sets aria-selected=false when cleared', function() {
      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      combobox.clearSelection()

      assert.equal(options[0].getAttribute('aria-selected'), 'false')
      assert.equal(input.hasAttribute('aria-activedescendant'), false)
    })

    it('scrolls when the selected item is not in view', function() {
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
      assert.equal(list.scrollTop, 36)
    })
  })
})
