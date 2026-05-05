import os
from launch import LaunchDescription
from launch.actions import (
    DeclareLaunchArgument,
    SetEnvironmentVariable,  
    LogInfo,
    IncludeLaunchDescription  
)
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    # ====== PACKAGES ======
    nav2_bringup_dir = get_package_share_directory('nav2_bringup')
    navibot_dir = get_package_share_directory('navibot_description')
    
    # ====== FICHIERS ======
    localization_launch = os.path.join(nav2_bringup_dir, 'launch', 'localization_launch.py')
    navigation_launch = os.path.join(nav2_bringup_dir, 'launch', 'navigation_launch.py')
    nav2_params = os.path.join(navibot_dir, 'config', 'nav2_params.yaml')
    rviz_config = os.path.join(navibot_dir, 'rviz', 'navibot.rviz')
    default_map = os.path.join(navibot_dir, 'maps', 'ma_carte.yaml')

    # ====== ⭐ ACTION CRITIQUE : FORCER L'ENVIRONNEMENT ⭐ ======
    set_sim_time_env = SetEnvironmentVariable(
        name='ROS_ARGUMENTS',
        value='-p use_sim_time:=true'
    )

    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='true',
        description='⚠️ DOIT ÊTRE TRUE POUR LA SIMULATION !'
    )
    
    declare_map = DeclareLaunchArgument(
        'map',
        default_value=default_map,
        description='Path to map'
    )
    
    declare_log_level = DeclareLaunchArgument(
        'log_level',
        default_value='error',
        description='Logging level'
    )
    
    declare_rviz = DeclareLaunchArgument(
        'rviz',
        default_value='true',
        description='Launch RViz with forced sim_time'
    )

    # ====== ⭐ RVIZ AVEC USE_SIM_TIME FORCÉ ⭐ ======
    rviz_node = Node(
        condition=IfCondition(LaunchConfiguration('rviz')),
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=[
            '-d', rviz_config,
            '--ros-args', '-p', 'use_sim_time:=true'
        ],
        parameters=[{
            'use_sim_time': True  
        }],
        output='screen'
    )

    # ====== LOCALIZATION ======
    start_localization = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(localization_launch),
        launch_arguments={
            'map': LaunchConfiguration('map'),
            'params_file': nav2_params,
            'use_sim_time': 'true',
            'autostart': 'true',
            'log_level': LaunchConfiguration('log_level'),
        }.items()
    )

    # ====== NAVIGATION ======
    start_navigation = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(navigation_launch),
        launch_arguments={
            'params_file': nav2_params,
            'use_sim_time': 'true',
            'autostart': 'true',
            'log_level': LaunchConfiguration('log_level'),
            'map_subscribe_transient_local': 'true',
        }.items()
    )

    return LaunchDescription([
        set_sim_time_env,
        declare_use_sim_time,
        declare_map,
        declare_log_level,
        declare_rviz,
        
        LogInfo(msg='⏱️ Lancement Nav2 avec use_sim_time:=true (FORCÉ)'),
        LogInfo(msg='👁️ Perception 3D active via LiDAR incliné (/scan_3d)'),
        
        start_localization,
        start_navigation,
        rviz_node,
        
        LogInfo(msg='✅ Nav2 prêt !'),
    ])
