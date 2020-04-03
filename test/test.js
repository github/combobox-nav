function press(input, key, ctrlKey) {
  input.dispatchEvent(new KeyboardEvent('keydown', {key, ctrlKey}))
}

describe('combobox-nav', function() {
  describe('with API', function() {
    beforeEach(function() {
      document.body.innerHTML = `
        <input aria-owns="list-id" role="combobox" type="text">
        <ul role="listbox" id="list-id">
          <li id="baymax" role="option">Baymax</li>
          <li><del>BB-8</del></li>
          <li id="hubot" role="option">Hubot</li>
          <li id="r2-d2" role="option">R2-D2</li>
        </ul>
      `
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('installs, navigates, and uninstalls', function() {
      const input = document.querySelector('input')
      const list = document.querySelector('ul')
      comboboxNav.install(input, list)

      press(input, 'ArrowDown')
      assert.equal(list.children[0].getAttribute('aria-selected'), 'true')
      comboboxNav.navigate(input, list, 1)
      assert.equal(list.children[2].getAttribute('aria-selected'), 'true')

      comboboxNav.uninstall(input, list)

      press(input, 'ArrowDown')
      assert.equal(list.children[2].getAttribute('aria-selected'), 'true')
    })
  })

  describe('with default setup', function() {
    beforeEach(function() {
      document.body.innerHTML = `
        <input aria-owns="list-id" role="combobox" type="text">
        <ul role="listbox" id="list-id">
          <li id="baymax" role="option">Baymax</li>
          <li><del>BB-8</del></li>
          <li id="hubot" role="option">Hubot</li>
          <li id="r2-d2" role="option">R2-D2</li>
          <li id="johnny-5" hidden role="option">Johnny 5</li>
          <li id="wall-e" role="option" aria-disabled="true">Wall-E</li>
          <li><a href="#wall-e" role="option">Wall-E</a></li>
        </ul>
      `
      comboboxNav.install(document.querySelector('input'), document.querySelector('ul'))
    })

    afterEach(function() {
      comboboxNav.uninstall(document.querySelector('input'), document.querySelector('ul'))
      document.body.innerHTML = ''
    })

    it('updates attributes on keyboard events', function() {
      const input = document.querySelector('input')
      const options = document.querySelectorAll('li')
      const expectedTargets = []

      document.addEventListener('combobox-commit', function({target}) {
        expectedTargets.push(target.id)
      })

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      press(input, 'ArrowDown')
      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')

      press(input, 'ArrowDown')
      assert.equal(options[3].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'r2-d2')

      press(input, 'ArrowDown')
      assert.equal(options[5].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'wall-e')
      press(input, 'Enter')
      options[5].click()

      press(input, 'ArrowUp')
      assert.equal(options[3].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'r2-d2')

      press(input, 'ArrowUp')
      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')
      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'hubot')
    })

    it('fires commit events on click', function() {
      const options = document.querySelectorAll('li')
      const expectedTargets = []

      document.addEventListener('combobox-commit', function({target}) {
        expectedTargets.push(target.id)
      })

      options[2].click()
      options[1].click()
      options[0].click()

      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'baymax')
    })

    it('fires event and follows the link on click', function() {
      let eventFired = false
      document.addEventListener('combobox-commit', function() {
        eventFired = true
      })

      document.querySelectorAll('[role=option]')[5].click()
      assert(eventFired)
      assert.equal(window.location.hash, '#wall-e')
    })

    it('clears aria-activedescendant and sets aria-selected=false when cleared', function() {
      const input = document.querySelector('input')
      const list = document.querySelector('ul')
      const options = document.querySelectorAll('li')

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')

      comboboxNav.clearSelection(input, list)

      assert.equal(options[0].getAttribute('aria-selected'), 'false')
      assert.equal(input.hasAttribute('aria-activedescendant'), false)
    })

    it('scrolls when the selected item is not in view', function() {
      const input = document.querySelector('input')
      const list = document.querySelector('ul')
      list.style.overflow = 'auto'
      list.style.height = '18px'
      list.style.position = 'relative'
      const options = document.querySelectorAll('li')
      assert.equal(list.scrollTop, 0)

      press(input, 'ArrowDown')
      assert.equal(options[0].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'baymax')
      assert.equal(list.scrollTop, 0)

      press(input, 'ArrowDown')

      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')
      assert.equal(list.scrollTop, 36)
    })
  })

  describe('with label/input as options', function() {
    beforeEach(function() {
      document.body.innerHTML = `
        <input aria-owns="list-id" role="combobox" type="text">
        <div id="list-id">
          <label id="baymax" role="option"><input type="checkbox" value="Baymax" hidden> Baymax</label>
          <label id="hubot" role="option"><input type="checkbox" value="Hubot" hidden> Hubot</label>
          <label id="r2-d2" role="option"><input type="checkbox" value="R2-D2" hidden> R2-D2</label>
        </div>
      `
      comboboxNav.install(document.querySelector('input'), document.querySelector('#list-id'))
    })

    afterEach(function() {
      comboboxNav.uninstall(document.querySelector('input'), document.querySelector('#list-id'))
      document.body.innerHTML = ''
    })

    it('fires event and input is checked', async function() {
      const listener = new Promise(resolve => {
        document.addEventListener('combobox-commit', () => {
          assert(
            document.querySelector('input[value="Hubot"]').checked,
            'input should be checked when combobox-commit is fired'
          )
          resolve()
        })
      })
      document.querySelectorAll('[role=option]')[1].click()
      await listener
    })
  })
})
