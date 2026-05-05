import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, TimerAction
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
import xacro

def generate_launch_description():
    package_name = 'navibot_description'
    pkg_share = get_package_share_directory(package_name)
    urdf_file = os.path.join(pkg_share, 'urdf', 'navibot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'lidar_world.sdf')

    # 1. Traitement URDF
    robot_description_config = xacro.process_file(urdf_file)
    robot_description = {'robot_description': robot_description_config.toxml()}

    # 2. Lancer Gazebo Ignition (Monde avec physique + capteurs)
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(get_package_share_directory('ros_gz_sim'), 'launch', 'gz_sim.launch.py')
        ]),
        launch_arguments={'gz_args': '-r ' + world_file}.items()
    )

    # 3. Robot State Publisher (AVEC use_sim_time)
    node_robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        output='screen',
        parameters=[robot_description, {'use_sim_time': True}]
    )

    # 4. Spawn Robot (Différé)
    spawn_entity = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=['-topic', 'robot_description', '-name', 'navibot'],
        output='screen'
    )
    timer_spawn = TimerAction(period=5.0, actions=[spawn_entity])

    # 5. Bridge (AVEC use_sim_time ET Clock)
    bridge = Node(
        package='ros_gz_bridge',
        executable='parameter_bridge',
        arguments=[
            '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
            '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
            '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
            '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
            '/tf@tf2_msgs/msg/TFMessage[gz.msgs.Pose_V'
        ],
        output='screen',
        parameters=[{'use_sim_time': True}]
    )

    # 6. FIX: Connection TF manquante (Gazebo -> URDF)
    # Gazebo publie 'navibot/base_footprint', URDF attend 'base_footprint'
    fix_base_footprint = Node(
        package='tf2_ros',
        executable='static_transform_publisher',
        arguments=['0', '0', '0', '0', '0', '0', 'navibot/base_footprint', 'base_footprint'],
        output='screen',
        parameters=[{'use_sim_time': True}]
    )

        # 7. FIX: Nom du frame Laser (Correction de l'ordre)
    fix_laser_frame = Node(
        package='tf2_ros',
        executable='static_transform_publisher',
        # Ordre: x y z yaw pitch roll PARENT ENFANT
        arguments=['0', '0', '0', '0', '0', '0', 'lidar_link', 'navibot/base_footprint/lidar_sensor'],
        output='screen',
        parameters=[{'use_sim_time': True}]
    )
    # 8. SLAM Toolbox (AVEC use_sim_time)
    slam = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(get_package_share_directory('slam_toolbox'), 'launch', 'online_async_launch.py')
        ]),
        launch_arguments={'use_sim_time': 'true'}.items()
    )

    return LaunchDescription([
        gazebo,
        node_robot_state_publisher,
        timer_spawn,
        bridge,
        fix_base_footprint,
        fix_laser_frame,
        slam
    ])
