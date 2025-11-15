export class FastAPIError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "FastAPIError";
  }
}

export class FastAPITimeoutError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "FastAPITimeoutError";
  }
}
