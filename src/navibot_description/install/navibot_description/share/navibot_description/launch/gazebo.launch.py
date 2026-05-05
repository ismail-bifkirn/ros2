import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, DeclareLaunchArgument
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
import xacro

def generate_launch_description():
    # REMPLACEZ CECI PAR LE VRAI NOM DE VOTRE PACKAGE
    package_name = 'navibot_description' 
    
    pkg_share = get_package_share_directory(package_name)

    # --- CHEMINS ---
    urdf_file = os.path.join(pkg_share, 'urdf', 'navibot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'lidar_world.sdf')
    
    # C'est ici qu'on définit où chercher le fichier RViz
    rviz_config_file = os.path.join(pkg_share, 'rviz', 'navibot.rviz')

    # --- VERIFICATION (Facultatif mais utile pour débugger) ---
    # Cela affichera un message si le fichier n'est pas trouvé
    if not os.path.exists(rviz_config_file):
        print(f"ATTENTION: Le fichier RViz n'existe pas ici: {rviz_config_file}")

    # --- TRAITEMENT URDF ---
    robot_description_config = xacro.process_file(urdf_file)
    robot_description = {'robot_description': robot_description_config.toxml()}

    # --- LANCEMENT ---
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(get_package_share_directory('gazebo_ros'), 'launch', 'gazebo.launch.py')
        ]),
        launch_arguments={'world': world_file}.items()
    )

    node_robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[robot_description, {'use_sim_time': True}]
    )

    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=['-topic', 'robot_description', '-entity', 'navibot'],
    )

    # Noeud RViz
    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        arguments=['-d', rviz_config_file], # On passe le fichier ici
        parameters=[{'use_sim_time': True}],
        output='screen'
    )

    return LaunchDescription([
        gazebo,
        node_robot_state_publisher,
        spawn_entity,
        rviz_node
    ])
