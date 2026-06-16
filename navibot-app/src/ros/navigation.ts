// Navigation autonome vers une pose cible
// Utilise l'action ROS2 NavigateToPose (Nav2) via rosbridge
// Trois fonctions : envoi d'objectif, annulation, récupération de la pose

import * as ROSLIB from 'roslib';
import { rosBridge } from './bridge';

// Conversion d'un angle de lacet (yaw) en quaternion ROS
function yawToQuat(yaw: number) {
  return { x: 0, y: 0, z: Math.sin(yaw / 2), w: Math.cos(yaw / 2) };
}

// Types pour les callbacks de navigation
export interface NavFeedback { distance_remaining: number }  // distance restante en mètres
export interface NavResult   { succeeded: boolean }           // résultat de la navigation

// Envoie un objectif de navigation (x, y, yaw) au robot via l'action NavigateToPose
// Retourne l'ID de l'objectif (pour annulation ultérieure) ou null si déconnecté
export function navigateToPose(
  x: number, y: number, yaw: number,
  onFeedback?: (f: NavFeedback) => void,
  onResult?:   (r: NavResult)   => void,
): string | null {
  if (!rosBridge.ros) return null;

  // Crée l'action ROS (client ROSLIB.Action)
  const action = new ROSLIB.Action({
    ros:        rosBridge.ros,
    name:       '/navigate_to_pose',
    actionType: 'nav2_msgs/action/NavigateToPose',
  });

  // Construit l'objectif avec timestamp courant
  const goal = {
    pose: {
      header: { frame_id: 'map', stamp: { sec: Math.floor(Date.now() / 1000), nanosec: 0 } },
      pose:   { position: { x, y, z: 0 }, orientation: yawToQuat(yaw) },
    },
    behavior_tree: '',  // utilise le BT par défaut de Nav2
  };

  return action.sendGoal(
    goal,
    (_result) => {
      onResult?.({ succeeded: true });
    },
    (feedback: any) => {
      onFeedback?.({ distance_remaining: feedback?.distance_remaining ?? 0 });
    },
    (error) => {
      console.error('Navigation failed:', error);
      onResult?.({ succeeded: false });
    },
  ) ?? null;
}

// Annule un objectif de navigation en cours via son ID
export function cancelNavigation(id: string) {
  if (!rosBridge.ros) return;
  const action = new ROSLIB.Action({
    ros:        rosBridge.ros,
    name:       '/navigate_to_pose',
    actionType: 'nav2_msgs/action/NavigateToPose',
  });
  action.cancelGoal(id);
}

// Récupère la position actuelle du robot sur la carte
// Utilise le TF client pour écouter la transformation map -> base_footprint
// Timeout de 3s si la TF n'est pas disponible
export async function getRobotPose(): Promise<{ x: number; y: number; yaw: number } | null> {
  if (!rosBridge.ros) return null;

  return new Promise((resolve) => {
    const tf = new ROSLIB.TFClient({
      ros:          rosBridge.ros!,
      fixedFrame:   'map',
      angularThres: 0.01,
      transThres:   0.01,
    });

    // Timeout de sécurité : résout null si pas de TF reçue dans les 3s
    const timeout = setTimeout(() => {
      tf.unsubscribe('base_footprint');
      (tf as any).dispose?.();
      resolve(null);
    }, 3000);

    tf.subscribe('base_footprint', (transform: any) => {
      clearTimeout(timeout);
      tf.unsubscribe('base_footprint');
      (tf as any).dispose?.();

      const { translation: t, rotation: r } = transform;
      // Conversion quaternion -> yaw (angle de lacet)
      const yaw = Math.atan2(
        2 * (r.w * r.z + r.x * r.y),
        1 - 2 * (r.y * r.y + r.z * r.z),
      );
      resolve({ x: t.x, y: t.y, yaw });
    });
  });
}
