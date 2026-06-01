import * as ROSLIB from 'roslib';

type BridgeStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
type StatusCb = (s: BridgeStatus) => void;

class RosBridgeManager {
  private static _inst: RosBridgeManager;
  public ros: ROSLIB.Ros | null = null;
  private _url = '';
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _cbs: StatusCb[] = [];

  static get instance() {
    if (!this._inst) this._inst = new RosBridgeManager();
    return this._inst;
  }

  onStatus(cb: StatusCb) {
    this._cbs.push(cb);
    return () => { this._cbs = this._cbs.filter(f => f !== cb); };
  }

  connect(url: string) {
    this._url = url;
    this._clearTimer();
    try { this.ros?.close(); } catch { /**/ }

    this._emit('connecting');
    this.ros = new ROSLIB.Ros({ url });

    this.ros.on('connection', () => {
      this._clearTimer();
      this._emit('connected');
    });
    this.ros.on('error',   () => this._emit('error'));
    this.ros.on('close',   () => {
      this._emit('disconnected');
      this._scheduleReconnect();
    });
  }

  disconnect() {
    this._clearTimer();
    this.ros?.close();
    this.ros = null;
    this._emit('disconnected');
  }

  private _emit(s: BridgeStatus) { this._cbs.forEach(cb => cb(s)); }

  private _scheduleReconnect() {
    if (this._timer) return;
    this._timer = setInterval(() => this.connect(this._url), 3000);
  }

  private _clearTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
}

export const rosBridge = RosBridgeManager.instance;
