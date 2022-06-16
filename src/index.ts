export default class Combobox {
  isComposing: boolean
  list: HTMLElement
  input: HTMLTextAreaElement | HTMLInputElement
  keyboardEventHandler: (event: KeyboardEvent) => void
  compositionEventHandler: (event: Event) => void
  inputHandler: (event: Event) => void

  constructor(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement) {
    this.input = input
    this.list = list
    this.isComposing = false

    if (!list.id) {
      list.id = `combobox-${Math.random().toString().slice(2, 6)}`
    }

    const ctrlBindings = !!navigator.userAgent.match(/Macintosh/)

    this.keyboardEventHandler = event => keyboardBindings(event, this, ctrlBindings)
    this.compositionEventHandler = event => trackComposition(event, this)
    this.inputHandler = this.clearSelection.bind(this)
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-controls', list.id)
    input.setAttribute('aria-expanded', 'false')
    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-haspopup', 'listbox')
  }

  destroy() {
    this.clearSelection()
    this.stop()

    this.input.removeAttribute('role')
    this.input.removeAttribute('aria-controls')
    this.input.removeAttribute('aria-expanded')
    this.input.removeAttribute('aria-autocomplete')
    this.input.removeAttribute('aria-haspopup')
  }

  start(): void {
    this.input.setAttribute('aria-expanded', 'true')
    this.input.addEventListener('compositionstart', this.compositionEventHandler)
    this.input.addEventListener('compositionend', this.compositionEventHandler)
    this.input.addEventListener('input', this.inputHandler)
    ;(this.input as HTMLElement).addEventListener('keydown', this.keyboardEventHandler)
    this.list.addEventListener('click', commitWithElement)
  }

  stop(): void {
    this.clearSelection()
    this.input.setAttribute('aria-expanded', 'false')
    this.input.removeEventListener('compositionstart', this.compositionEventHandler)
    this.input.removeEventListener('compositionend', this.compositionEventHandler)
    this.input.removeEventListener('input', this.inputHandler)
    ;(this.input as HTMLElement).removeEventListener('keydown', this.keyboardEventHandler)
    this.list.removeEventListener('click', commitWithElement)
  }

  navigate(indexDiff: -1 | 1 = 1): void {
    const focusEl = Array.from(this.list.querySelectorAll<HTMLElement>('[aria-selected="true"]')).filter(visible)[0]
    const els = Array.from(this.list.querySelectorAll<HTMLElement>('[role="option"]')).filter(visible)
    const focusIndex = els.indexOf(focusEl)

    if ((focusIndex === els.length - 1 && indexDiff === 1) || (focusIndex === 0 && indexDiff === -1)) {
      this.clearSelection()
      this.input.focus()
      return
    }

    let indexOfItem = indexDiff === 1 ? 0 : els.length - 1
    if (focusEl && focusIndex >= 0) {
      const newIndex = focusIndex + indexDiff
      if (newIndex >= 0 && newIndex < els.length) indexOfItem = newIndex
    }

    const target = els[indexOfItem]
    if (!target) return
    for (const el of els) {
      if (target === el) {
        this.input.setAttribute('aria-activedescendant', target.id)
        target.setAttribute('aria-selected', 'true')
        scrollTo(this.list, target)
      } else {
        el.setAttribute('aria-selected', 'false')
      }
    }
  }

  clearSelection(): void {
    this.input.removeAttribute('aria-activedescendant')
    for (const el of this.list.querySelectorAll('[aria-selected="true"]')) {
      el.setAttribute('aria-selected', 'false')
    }
  }
}

function keyboardBindings(event: KeyboardEvent, combobox: Combobox, ctrlBindings: boolean) {
  if (event.shiftKey || event.metaKey || event.altKey) return
  if (!ctrlBindings && event.ctrlKey) return
  if (combobox.isComposing) return

  switch (event.key) {
    case 'Enter':
    case 'Tab':
      if (commit(combobox.input, combobox.list)) {
        event.preventDefault()
      }
      break
    case 'Escape':
      combobox.clearSelection()
      break
    case 'ArrowDown':
      combobox.navigate(1)
      event.preventDefault()
      break
    case 'ArrowUp':
      combobox.navigate(-1)
      event.preventDefault()
      break
    case 'n':
      if (ctrlBindings && event.ctrlKey) {
        combobox.navigate(1)
        event.preventDefault()
      }
      break
    case 'p':
      if (ctrlBindings && event.ctrlKey) {
        combobox.navigate(-1)
        event.preventDefault()
      }
      break
    default:
      if (event.ctrlKey) break
      combobox.clearSelection()
  }
}

function commitWithElement(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const target = event.target.closest('[role="option"]')
  if (!target) return
  if (target.getAttribute('aria-disabled') === 'true') return
  fireCommitEvent(target)
}

function commit(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement): boolean {
  const target = list.querySelector<HTMLElement>('[aria-selected="true"]')
  if (!target) return false
  if (target.getAttribute('aria-disabled') === 'true') return true
  target.click()
  return true
}

function fireCommitEvent(target: Element): void {
  target.dispatchEvent(new CustomEvent('combobox-commit', {bubbles: true}))
}

function visible(el: HTMLElement): boolean {
  return (
    !el.hidden &&
    !(el instanceof HTMLInputElement && el.type === 'hidden') &&
    (el.offsetWidth > 0 || el.offsetHeight > 0)
  )
}

function trackComposition(event: Event, combobox: Combobox): void {
  combobox.isComposing = event.type === 'compositionstart'

  const list = document.getElementById(combobox.input.getAttribute('aria-controls') || '')
  if (!list) return

  combobox.clearSelection()
}

function scrollTo(container: HTMLElement, target: HTMLElement) {
  if (!inViewport(container, target)) {
    container.scrollTop = target.offsetTop
  }
}

function inViewport(container: HTMLElement, element: HTMLElement): boolean {
  const scrollTop = container.scrollTop
  const containerBottom = scrollTop + container.clientHeight
  const top = element.offsetTop
  const bottom = top + element.clientHeight
  return top >= scrollTop && bottom <= containerBottom
}
