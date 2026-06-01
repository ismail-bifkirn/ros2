import os
from launch import LaunchDescription
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    pkg_share = FindPackageShare('navibot_description').find('navibot_description')
    slam_params_file = os.path.join(pkg_share, 'config', 'slam_params.yaml')

    slam_toolbox_node = Node(
        package='slam_toolbox',
        executable='async_slam_toolbox_node',
        name='slam_toolbox',
        output='screen',
        parameters=[{'use_sim_time': True}, slam_params_file]
    )

    return LaunchDescription([
        slam_toolbox_node,
    ])
