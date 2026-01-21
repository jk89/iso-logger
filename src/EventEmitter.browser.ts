type Listener = (...args: unknown[]) => void;

export class EventEmitter {
  private listeners = new Map<string | symbol, Listener[]>();

  on(event: string | symbol, listener: Listener): this {
    const existing = this.listeners.get(event) ?? [];
    existing.push(listener);
    this.listeners.set(event, existing);
    return this;
  }

  off(event: string | symbol, listener: Listener): this {
    const existing = this.listeners.get(event);
    if (existing) {
      const index = existing.indexOf(listener);
      if (index !== -1) {
        existing.splice(index, 1);
      }
    }
    return this;
  }

  emit(event: string | symbol, ...args: unknown[]): boolean {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    for (const listener of listeners) {
      listener(...args);
    }
    return true;
  }

  removeAllListeners(event?: string | symbol): this {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}
