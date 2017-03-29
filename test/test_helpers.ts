import { Application, Controller } from "stimulus"
const { assert, module, test } = QUnit

export { assert, test }

export function testGroup(name: string, callback: Function) {
  module(name, function (hooks) {
    hooks.beforeEach(function () {
      this.application = Application.start()
    })

    hooks.afterEach(function () {
      this.application.stop()
    })

    callback(hooks)
  })
}

export function getFixture(): HTMLDivElement {
  return document.getElementById("qunit-fixture") as HTMLDivElement
}

export function setFixture(content: string | Element) {
  if (typeof content == "string") {
    getFixture().innerHTML = content
  } else {
    getFixture().appendChild(content)
  }

  return nextFrame()
}

export function nextFrame(): Promise<any> {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}

let identifierId = 0

export function createControllerFixture(elementContentTemplate: string = "") {
  const identifier = `fixture-${identifierId++}`
  const element = createControllerElement(identifier, elementContentTemplate)
  const counts = { initialize: 0, connect: 0, disconnect: 0 }

  class constructor extends Controller {
    initialize() { counts.initialize++ }
    connect()    { counts.connect++ }
    disconnect() { counts.disconnect++ }
  }

  return { identifier, element, constructor, counts }
}

export function createControllerElement(identifier: string, contentTemplate: string = ""): HTMLDivElement {
  const container = document.createElement("div")
  container.innerHTML = `
    <div data-controller="{{identifier}}">
      ${contentTemplate}
    </div>
  `.trim().replace(/\{\{identifier\}\}/g, identifier)
  return container.firstElementChild as HTMLDivElement
}

export function triggerEvent(element: Element, type: string): Event {
  const event = document.createEvent("Events")
  event.initEvent(type, true, true)
  // IE <= 11 does not set `defaultPrevented` when `preventDefault()` is called on synthetic events
  event.preventDefault = function() {
    Object.defineProperty(this, "defaultPrevented", {
      get: function() {
        return true
      }
    })
  }
  element.dispatchEvent(event)
  return event
}