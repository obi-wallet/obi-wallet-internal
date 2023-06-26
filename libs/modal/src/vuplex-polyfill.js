class VuplexPolyfill {
  constructor() {
    this._listeners = {};
    window.addEventListener("message", this._handleWindowMessage.bind(this));
  }

  addEventListener(eventName, listener) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    if (this._listeners[eventName].indexOf(listener) === -1) {
      this._listeners[eventName].push(listener);
    }
  }

  removeEventListener(eventName, listener) {
    if (!this._listeners[eventName]) {
      return;
    }
    const index = this._listeners[eventName].indexOf(listener);
    if (index !== -1) {
      this._listeners[eventName].splice(index, 1);
    }
  }

  postMessage(message) {
    // Don't pass a string to JSON.stringify() because it adds extra quotes.
    const messageString =
      typeof message === "string" ? message : JSON.stringify(message);
    // eslint-disable-next-line no-restricted-globals
    parent.postMessage(
      {
        type: "vuplex.postMessage",
        message: messageString,
      },
      "*"
    );
  }

  _emit(eventName, ...args) {
    if (!this._listeners[eventName]) {
      return;
    }
    for (const listener of this._listeners[eventName]) {
      try {
        listener(...args);
      } catch (error) {
        console.error(
          `An error occurred while invoking the '${eventName}' event handler.`,
          error
        );
      }
    }
  }

  _handleWindowMessage(event) {
    if (event.data && event.data.type === "vuplex.postMessage") {
      this._emit("message", { data: event.data.message });
    }
  }
}

if (!window.vuplex) {
  window.vuplex = new VuplexPolyfill();
}
