class Stats {

  stored = 0;

  searched = 0;

  ignored = 0;

  broadcasts = 0;

  duplicateSkipped = 0;

  activeConnections = 0;

  increment(
    key: keyof Stats
  ) {
    // @ts-ignore
    this[key]++;
  }

  get() {
    return {
      stored: this.stored,
      searched: this.searched,
      ignored: this.ignored,
      broadcasts: this.broadcasts,
      duplicateSkipped: this.duplicateSkipped,
      activeConnections: this.activeConnections,
      uptime:
        Math.floor(process.uptime()) + "s",
    };
  }
}

export const stats = new Stats();