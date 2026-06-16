// Commande de vitesse manuelle du robot (topic /cmd_vel)
// Publie des messages geometry_msgs/Twist pour contrôler le robot en mode manuel
// Thread-safe : le joystick publie à 20 Hz via setInterval

import * as ROSLIB from 'roslib';
import { rosBridge } from './bridge';

// Type d'un message Twist ROS (vitesse linéaire + angulaire)
type Twist = { linear: { x: number; y: number; z: number }; angular: { x: number; y: number; z: number } };

let _topic: ROSLIB.Topic<Twist> | null = null;

// Retourne le topic /cmd_vel, en le créant si nécessaire (ou si la connexion a changé)
function topic(): ROSLIB.Topic<Twist> {
  if (!rosBridge.ros) throw new Error('not connected');
  if (!_topic || ((_topic as any).ros) !== rosBridge.ros) {
    _topic = new ROSLIB.Topic<Twist>({
      ros: rosBridge.ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });
  }
  return _topic;
}

// Publie une commande de vitesse (linéaire en m/s, angulaire en rad/s)
// Les erreurs sont silencieusement ignorées (ex: déconnexion)
export function publishCmdVel(linear: number, angular: number) {
  try {
    topic().publish({
      linear:  { x: linear, y: 0, z: 0 },
      angular: { x: 0,      y: 0, z: angular },
    });
  } catch { /* silencieux si déconnecté */ }
}

// Arrêt d'urgence : publie vitesse nulle
export const stopRobot = () => publishCmdVel(0, 0);
