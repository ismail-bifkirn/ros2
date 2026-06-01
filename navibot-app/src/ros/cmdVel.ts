import * as ROSLIB from 'roslib';
import { rosBridge } from './bridge';

type Twist = { linear: { x: number; y: number; z: number }; angular: { x: number; y: number; z: number } };

let _topic: ROSLIB.Topic<Twist> | null = null;

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

export function publishCmdVel(linear: number, angular: number) {
  try {
    topic().publish({
      linear:  { x: linear, y: 0, z: 0 },
      angular: { x: 0,      y: 0, z: angular },
    });
  } catch { /* silently drop when disconnected */ }
}

export const stopRobot = () => publishCmdVel(0, 0);
