"""Lancement autonome du noeud EKF (robot_localization).

Fusionne /odom (roues) + /imu (IMU Gazebo) et publie:
  - le topic /odometry/filtered
  - la TF odom -> base_footprint  (en remplacement de celle de
    gazebo_ros_diff_drive, qui est désactivée dans l'URDF)

Inclure ce launch après le spawn du robot dans Gazebo, ou le lancer
manuellement pour le tester en isolation.
"""

import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    pkg_share = get_package_share_directory('navibot_description')
    ekf_params = os.path.join(pkg_share, 'config', 'ekf.yaml')

    ekf_node = Node(
        package='robot_localization',
        executable='ekf_node',
        name='ekf_node',
        output='screen',
        parameters=[ekf_params, {'use_sim_time': True}],
    )

    return LaunchDescription([ekf_node])
