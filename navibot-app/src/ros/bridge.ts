// Pont de communication ROS vers l'application via rosbridge WebSocket
// Utilise la bibliothèque roslib.js pour se connecter à rosbridge_server
// Pattern: singleton + observateur (publish/subscribe) pour les changements d'état

import * as ROSLIB from 'roslib';

// États possibles de la connexion WebSocket
type BridgeStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
type StatusCb = (s: BridgeStatus) => void;

class RosBridgeManager {
  private static _inst: RosBridgeManager;   // instance unique (singleton)
  public ros: ROSLIB.Ros | null = null;     // connexion ROS active
  private _url = '';                         // dernière URL utilisée (reconnexion)
  private _timer: ReturnType<typeof setInterval> | null = null;  // timer de reconnexion
  private _cbs: StatusCb[] = [];            // observateurs de statut

  static get instance() {
    if (!this._inst) this._inst = new RosBridgeManager();
    return this._inst;
  }

  // Permet de s'abonner aux changements d'état de la connexion
  // Retourne une fonction de désabonnement
  onStatus(cb: StatusCb) {
    this._cbs.push(cb);
    return () => { this._cbs = this._cbs.filter(f => f !== cb); };
  }

  private _errMsg = '';
  get lastError() { return this._errMsg; }

  // Établit la connexion WebSocket vers l'URL donnée
  connect(url: string) {
    this._url = url;
    this._clearTimer();
    this._errMsg = '';
    try { this.ros?.close(); } catch { /* silencieux si déjà fermé */ }

    this._emit('connecting');
    try {
      this.ros = new ROSLIB.Ros({ url });
    } catch (e: unknown) {
      this._errMsg = String(e);
      this._emit('error');
      return;
    }

    // Événements de la connexion ROS
    this.ros.on('connection', () => {
      this._clearTimer();
      this._errMsg = '';
      this._emit('connected');
    });
    this.ros.on('error',   (e: unknown) => {
      this._errMsg = (e as any)?.message ?? String(e) ?? 'unknown error';
      this._emit('error');
    });
    this.ros.on('close',   () => {
      this._emit('disconnected');
      this._scheduleReconnect();  // tentative de reconnexion automatique
    });
  }

  // Fermeture explicite de la connexion
  disconnect() {
    this._clearTimer();
    this.ros?.close();
    this.ros = null;
    this._emit('disconnected');
  }

  // Notification de tous les observateurs
  private _emit(s: BridgeStatus) { this._cbs.forEach(cb => cb(s)); }

  // Reconnexion automatique toutes les 3 secondes
  private _scheduleReconnect() {
    if (this._timer) return;  // déjà un timer actif
    this._timer = setInterval(() => this.connect(this._url), 3000);
  }

  // Arrêt du timer de reconnexion
  private _clearTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
}

// Export de l'instance unique du gestionnaire de connexion
export const rosBridge = RosBridgeManager.instance;
