/* @flow strict */

import {scrollTo} from './scroll'

export function install(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement): void {
  input.addEventListener('compositionstart', trackComposition)
  input.addEventListener('compositionend', trackComposition)
  input.addEventListener('keydown', keyboardBindings)
  list.addEventListener('click', commitWithElement)
}

export function uninstall(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement): void {
  input.removeAttribute('aria-activedescendant')
  input.removeEventListener('compositionstart', trackComposition)
  input.removeEventListener('compositionend', trackComposition)
  input.removeEventListener('keydown', keyboardBindings)
  list.removeEventListener('click', commitWithElement)
}

let isComposing = false
const ctrlBindings = !!navigator.userAgent.match(/Macintosh/)

function keyboardBindings(event: KeyboardEvent) {
  if (event.shiftKey || event.metaKey || event.altKey) return
  const input = event.currentTarget
  if (!(input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement)) return
  if (isComposing) return
  const list = document.getElementById(input.getAttribute('aria-owns') || '')
  if (!list) return

  switch (event.key) {
    case 'Enter':
    case 'Tab':
      if (commit(input, list)) {
        event.preventDefault()
      }
      break
    case 'Escape':
      clearSelection(input, list)
      break
    case 'ArrowDown':
      navigate(input, list, 1)
      event.preventDefault()
      break
    case 'ArrowUp':
      navigate(input, list, -1)
      event.preventDefault()
      break
    case 'n':
      if (ctrlBindings && event.ctrlKey) {
        navigate(input, list, 1)
        event.preventDefault()
      }
      break
    case 'p':
      if (ctrlBindings && event.ctrlKey) {
        navigate(input, list, -1)
        event.preventDefault()
      }
      break
  }
}

function commitWithElement(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const target = event.target.closest('[role="option"]')
  if (!target) return
  if (target.getAttribute('aria-disabled') === 'true') return
  fireCommitEvent(target, 'combobox-commit')
  setTimeout(() => fireCommitEvent(target, 'combobox-committed'), 0)
}

function commit(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement): boolean {
  const target = list.querySelector('[aria-selected="true"]')
  if (!target) return false
  if (target.getAttribute('aria-disabled') === 'true') return true
  target.click()
  return true
}

function fireCommitEvent(target: Element, event: string): void {
  target.dispatchEvent(
    new CustomEvent(event, {
      bubbles: true
    })
  )
}

function visible(el): boolean {
  return !el.hidden && (!el.type || el.type !== 'hidden') && (el.offsetWidth > 0 || el.offsetHeight > 0)
}

export function navigate(
  input: HTMLTextAreaElement | HTMLInputElement,
  list: HTMLElement,
  indexDiff: -1 | 1 = 1
): void {
  const focusEl = Array.from(list.querySelectorAll('[aria-selected="true"]')).filter(visible)[0]
  const els = Array.from(list.querySelectorAll('[role="option"]')).filter(visible)
  const focusIndex = els.indexOf(focusEl)
  let indexOfItem = indexDiff === 1 ? 0 : els.length - 1
  if (focusEl && focusIndex >= 0) {
    const newIndex = focusIndex + indexDiff
    if (newIndex >= 0 && newIndex < els.length) indexOfItem = newIndex
  }

  const target = els[indexOfItem]
  if (!target) return
  for (const el of els) {
    if (target === el) {
      input.setAttribute('aria-activedescendant', target.id)
      target.setAttribute('aria-selected', 'true')
      scrollTo(list, target)
    } else {
      el.setAttribute('aria-selected', 'false')
    }
  }
}

export function clearSelection(input: HTMLTextAreaElement | HTMLInputElement, list: HTMLElement): void {
  input.removeAttribute('aria-activedescendant')
  for (const el of list.querySelectorAll('[aria-selected="true"]')) {
    el.setAttribute('aria-selected', 'false')
  }
}

function trackComposition(event: Event): void {
  const input = event.currentTarget
  if (!(input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement)) return
  isComposing = event.type === 'compositionstart'

  const list = document.getElementById(input.getAttribute('aria-owns') || '')
  if (!list) return

  clearSelection(input, list)
}
