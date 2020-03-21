import { debounce } from 'throttle-debounce'
import Vue from 'vue'

export const pullRefreshController = (() => {
  const TRIGGER_OFFSET_MAX = 150
  let startY = null

  const notifySubscribers = debounce(350, false, () => {
    return Promise.all(subscribers.map(s => s.refresh()))
      .finally(() => { refresh.isRefreshing = false })
  })

  document.body.addEventListener('touchstart', e => {
    startY = e.touches[0].pageY
  }, {passive: true})

  document.body.addEventListener('touchmove', e => {
    const y = e.touches[0].pageY
    if (!startY || refresh.isRefreshing || subscribers.length === 0) return
    if (document.scrollingElement.scrollTop === 0 && y > startY) {
      const triggerOffset = y - startY
      refresh.triggerProgress = (triggerOffset / TRIGGER_OFFSET_MAX) * 100
      if (triggerOffset > TRIGGER_OFFSET_MAX) {
        refresh.isRefreshing = true
        refresh.triggerProgress = 0
        notifySubscribers()
      }
    }
  }, {passive: true})

  document.body.addEventListener('touchend', () => {
    refresh.triggerProgress = 0
    startY = null
  }, {passive: true})

  const subscribers = []
  const refresh = Vue.observable({
    triggerProgress: 0,
    isRefreshing: false,
    subscribe (subscriber) {
      subscribers.push(subscriber)
    },
    unsubscribe (subscriber) {
      const index = subscribers.indexOf(subscriber)
      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
  })
  return refresh
})()
