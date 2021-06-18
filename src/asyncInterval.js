/**
 * @author Jacob McCrumb (dev.to)
 * @author Brandon Ingli
 * Handles intervals for asynchronous functions
 */

class AsyncInterval{
  /**
   * 
   * @param {function} cb Callback function
   * @param {number} interval interval in milliseconds (> 0) to wait between executions
   * @throws Error if cb is not a function
   * @throws Error if interval is <= 0
   */
  constructor(cb, interval) {
    if (cb && typeof cb === "function") {
      this._cb = cb;
    } else {
      throw new Error('Callback must be a function');
    }
    if (interval > 0){
      this._interval = interval;
    } else {
      throw new Error('Interval must be greater than zero');
    }
  }

  /**
   * Starts the task.
   * Note: If the task is stopped with stop(), you must first 
   * set the interval to the desired value explicitly. Otherwise, this 
   * function acts the same as runOnce().
   */
  async start() {
    await this._cb();
    if(this._interval) {
      setTimeout(() => this.run(), this._interval)
    }
  }

  /**
   * Runs the callback function once.
   */
  async runOnce() {
    await this._cb();
  }

  /**
   * Stops the task. Any scheduled runs will still run, but no new ones 
   * will be scheduled.
   */
  stop() {
    this._interval = false;
  }

  /**
   * Get the current interval
   * @return {number | boolean} current interval in milliseconds, or false if stopped.
   */
  get interval() {
    return this._interval;
  }

  /**
   * Set the current interval
   * @param {number} i interval in milliseconds (> 0);
   * @throws Error if interval is <= 0;
   */
  set interval(i) {
    if (i > 0){
      this._interval = i;
    } else {
      throw new Error('Interval must be greater than zero');
    }
  }
}
 
 module.exports = {AsyncInterval};