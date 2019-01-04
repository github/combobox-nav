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
          <li id="wall-e" role="option" aria-disabled="true">Wall-E</li>
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

      press(input, 'n', true)
      assert.equal(options[2].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'hubot')

      press(input, 'Enter')

      press(input, 'n', true)
      assert.equal(options[3].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'r2-d2')

      press(input, 'n', true)
      assert.equal(options[4].getAttribute('aria-selected'), 'true')
      assert.equal(input.getAttribute('aria-activedescendant'), 'wall-e')
      press(input, 'Enter')

      press(input, 'p', true)
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

      options[2].dispatchEvent(new MouseEvent('click', {bubbles: true}))
      options[1].dispatchEvent(new MouseEvent('click', {bubbles: true}))
      options[0].dispatchEvent(new MouseEvent('click', {bubbles: true}))

      assert.equal(expectedTargets.length, 2)
      assert.equal(expectedTargets[0], 'hubot')
      assert.equal(expectedTargets[1], 'baymax')
    })
  })
})
