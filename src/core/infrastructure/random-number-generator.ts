import { injectable } from "inversify";

@injectable()
export class RandomNumberGenerator {
  public equal() {
    let result = 0;
    while (result === 0) {
      result = Math.random();
    }
    return result;
  }

  public exponential() {
    const value = -1 * Math.log(this.equal())
    return value;
  }
}

export class NotSoRandomNumberGenerator extends RandomNumberGenerator {

  private readonly values = [0.42, 0.53, 0.64, 0.75, 0.86, 0.97, 0.07, 0.18, 0.29, 0.32, 0.01, 0.99]
  private counter = 0;

  public equal() {
    this.counter++;
    return this.values[this.counter % this.values.length]
  }
}