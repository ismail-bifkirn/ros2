import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable, TimerAction
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution, FindPackageShare
from launch_ros.actions import Node

def generate_launch_description():
    pkg_name = 'navibot_description'
    pkg_share = get_package_share_directory(pkg_name)
    
    # Arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    map_yaml_file = LaunchConfiguration('map', default=os.path.expanduser('~/ros2_ws/src/navibot_description/maps/ma_carte.yaml'))
    autostart = LaunchConfiguration('autostart', default='true')

    # Paths
    # NOTE: Assurez-vous que votre fichier est bien dans 'config', sinon changez pour 'maps'
    nav2_params_file = os.path.join(pkg_share, 'config', 'nav2_params.yaml')

    # Map Server
    map_server = Node(
        package='nav2_map_server',
        executable='map_server',
        name='map_server',
        parameters=[{'use_sim_time': use_sim_time, 'yaml_filename': map_yaml_file}]
    )

    # AMCL
    amcl = Node(
        package='nav2_amcl',
        executable='amcl',
        name='amcl',
        parameters=[nav2_params_file]
    )

    # 1. Controller Server
    # On envoie les commandes vers le Smoother, pas directement au robot
    controller_server = Node(
        package='nav2_controller',
        executable='controller_server',
        name='controller_server',
        parameters=[nav2_params_file],
        remappings=[
            ('cmd_vel', 'cmd_vel_raw') # Sortie vers le lisseur
        ]
    )

    # 2. Velocity Smoother
    # Il lisse les commandes du contrôleur
    velocity_smoother = Node(
        package='nav2_velocity_smoother',
        executable='velocity_smoother',
        name='velocity_smoother',
        parameters=[nav2_params_file],
        remappings=[
            ('cmd_vel', 'cmd_vel_raw'),            # Entrée : vient du contrôleur
            ('cmd_vel_smoothed', 'cmd_vel_safe')   # Sortie : vers le moniteur de collision
        ]
    )

    # 3. COLLISION MONITOR (Inséré ICI)
    # Il vérifie si la commande "safe" va percuter quelque chose
    collision_monitor = Node(
        package='nav2_collision_monitor',
        executable='collision_monitor',
        name='collision_monitor',
        parameters=[nav2_params_file],
        remappings=[
            ('cmd_vel_in', 'cmd_vel_safe'),               # Entrée : vient du lisseur
            ('cmd_vel_out', '/diff_cont/cmd_vel_unstamped') # Sortie : vers le robot
        ]
    )

    # Autres serveurs
    planner_server = Node(
        package='nav2_planner',
        executable='planner_server',
        name='planner_server',
        parameters=[nav2_params_file]
    )

    behavior_server = Node(
        package='nav2_behaviors',
        executable='behavior_server',
        name='behavior_server',
        parameters=[nav2_params_file]
    )

    bt_navigator = Node(
        package='nav2_bt_navigator',
        executable='bt_navigator',
        name='bt_navigator',
        parameters=[nav2_params_file]
    )

    waypoint_follower = Node(
        package='nav2_waypoint_follower',
        executable='waypoint_follower',
        name='waypoint_follower',
        parameters=[nav2_params_file]
    )

    # Lifecycle Managers
    lifecycle_manager_localization = Node(
        package='nav2_lifecycle_manager',
        executable='lifecycle_manager',
        name='lifecycle_manager_localization',
        parameters=[{'use_sim_time': use_sim_time, 'autostart': autostart, 'node_names': ['map_server', 'amcl']}]
    )

    lifecycle_manager_navigation = Node(
        package='nav2_lifecycle_manager',
        executable='lifecycle_manager',
        name='lifecycle_manager_navigation',
        parameters=[{'use_sim_time': use_sim_time, 'autostart': autostart, 
                     # On ajoute 'collision_monitor' à la liste des nœuds à gérer
                     'node_names': ['controller_server', 'planner_server', 'behavior_server', 'bt_navigator', 'waypoint_follower', 'velocity_smoother', 'collision_monitor']}]
    )

    # RViz
    rviz_config_file = PathJoinSubstitution([FindPackageShare(pkg_name), 'rviz', 'nav2_view.rviz'])
    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=['-d', rviz_config_file],
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument('use_sim_time', default_value='true'),
        DeclareLaunchArgument('map', default_value=os.path.expanduser('~/ros2_ws/src/navibot_description/maps/ma_carte.yaml')),
        
        map_server,
        amcl,
        lifecycle_manager_localization,
        
        TimerAction(
            period=3.0,
            actions=[
                controller_server,
                planner_server,
                behavior_server,
                bt_navigator,
                waypoint_follower,
                velocity_smoother,
                collision_monitor, # <--- On lance le moniteur ici
                lifecycle_manager_navigation
            ]
        ),
        
        TimerAction(period=5.0, actions=[rviz_node])
    ])
