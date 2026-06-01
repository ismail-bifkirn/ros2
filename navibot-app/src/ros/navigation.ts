import * as ROSLIB from 'roslib';
import { rosBridge } from './bridge';

function yawToQuat(yaw: number) {
  return { x: 0, y: 0, z: Math.sin(yaw / 2), w: Math.cos(yaw / 2) };
}

export interface NavFeedback { distance_remaining: number }
export interface NavResult   { succeeded: boolean }

export function navigateToPose(
  x: number, y: number, yaw: number,
  onFeedback?: (f: NavFeedback) => void,
  onResult?:   (r: NavResult)   => void,
): string | null {
  if (!rosBridge.ros) return null;

  const action = new ROSLIB.Action({
    ros:        rosBridge.ros,
    name:       '/navigate_to_pose',
    actionType: 'nav2_msgs/action/NavigateToPose',
  });

  const goal = {
    pose: {
      header: { frame_id: 'map', stamp: { sec: 0, nanosec: 0 } },
      pose:   { position: { x, y, z: 0 }, orientation: yawToQuat(yaw) },
    },
    behavior_tree: '',
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

export function cancelNavigation(id: string) {
  if (!rosBridge.ros) return;
  const action = new ROSLIB.Action({
    ros:        rosBridge.ros,
    name:       '/navigate_to_pose',
    actionType: 'nav2_msgs/action/NavigateToPose',
  });
  action.cancelGoal(id);
}

export async function getRobotPose(): Promise<{ x: number; y: number; yaw: number } | null> {
  if (!rosBridge.ros) return null;

  return new Promise((resolve) => {
    const tf = new ROSLIB.TFClient({
      ros:          rosBridge.ros!,
      fixedFrame:   'map',
      angularThres: 0.01,
      transThres:   0.01,
    });

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
      const yaw = Math.atan2(
        2 * (r.w * r.z + r.x * r.y),
        1 - 2 * (r.y * r.y + r.z * r.z),
      );
      resolve({ x: t.x, y: t.y, yaw });
    });
  });
}
