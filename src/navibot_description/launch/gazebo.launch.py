import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import (
    IncludeLaunchDescription,
    SetEnvironmentVariable,
    TimerAction,
    LogInfo
)
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
import xacro


def generate_launch_description():
    # =====================================================================
    # 1. PACKAGES & CHEMINS
    # =====================================================================
    package_name = 'navibot_description' 
    pkg_share = get_package_share_directory(package_name)
    hospital_pkg_name = 'aws_robomaker_hospital_world'

    try:
        hospital_pkg_share = get_package_share_directory(hospital_pkg_name)
        print(f"✅ Hospital package found: {hospital_pkg_share}")
    except Exception:
        hospital_pkg_share = os.path.join(
            os.path.expanduser('~'), 'ros2_ws', 'src', 'aws-robomaker-hospital-world'
        )
        print(f"⚠️  Hospital package not built. Using source: {hospital_pkg_share}")

    # Chemins des fichiers
    urdf_file = os.path.join(pkg_share, 'urdf', 'navibot.urdf.xacro')
    world_file = os.path.join(hospital_pkg_share, 'worlds', 'hospital.world')
    
    models_dir = os.path.join(hospital_pkg_share, 'models')
    fuel_models_dir = os.path.join(hospital_pkg_share, 'fuel_models')
    
    # Configuration GAZEBO_MODEL_PATH
    current_model_path = os.environ.get('GAZEBO_MODEL_PATH', '')
    new_paths = f"{models_dir}:{fuel_models_dir}"
    gazebo_model_path = f"{new_paths}:{current_model_path}" if current_model_path else new_paths

    # =====================================================================
    # 2. PROCESSUS URDF/XACRO
    # =====================================================================
    try:
        robot_description_config = xacro.process_file(urdf_file)
        robot_description = {'robot_description': robot_description_config.toxml()}
        print(f"✅ URDF processed successfully from: {urdf_file}")
    except Exception as e:
        print(f"❌ Error processing URDF: {e}")
        raise

    # =====================================================================
    # 3. ENVIRONMENT VARIABLES
    # =====================================================================
    set_model_path = SetEnvironmentVariable(
        name='GAZEBO_MODEL_PATH',
        value=gazebo_model_path
    )
    
    set_sim_time_env = SetEnvironmentVariable(
        name='ROS_ARGUMENTS',
        value='-p use_sim_time:=true'
    )

    # =====================================================================
    # 4. GAZEBO LAUNCH
    # =====================================================================
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(get_package_share_directory('gazebo_ros'), 'launch', 'gazebo.launch.py')
        ]),
        launch_arguments={
            'world': world_file,
            'verbose': 'true',
            'extra_gazebo_args': '--renderer ogre2' 
        }.items()
    )

    # =====================================================================
    # 5. ROBOT STATE PUBLISHER
    # =====================================================================
    node_robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[
            robot_description, 
            {
                'use_sim_time': True,
                'publish_frequency': 20.0,
                'frame_prefix': ''
            }
        ],
        output='screen',
        arguments=['--ros-args', '-p', 'use_sim_time:=true']
    )

    # =====================================================================
    # 6. SPAWN ENTITY
    # =====================================================================
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description', 
            '-entity', 'navibot',
            '-x', '5.0', '-y', '3.0', '-z', '0.0',
            '-R', '0.0', '-P', '0.0', '-Y', '0.0'       
        ],
        parameters=[{'use_sim_time': True}],
        output='screen'
    )

    # =====================================================================
    # 7. LOGS & RETURN
    # =====================================================================
    return LaunchDescription([
        set_model_path,
        set_sim_time_env,
        LogInfo(msg='🚀 Lancement Gazebo...'),
        gazebo,
        
        # On attend 5s que Gazebo soit prêt
        TimerAction(
            period=5.0,  
            actions=[
                LogInfo(msg='🤖 Publication URDF et Spawn...'),
                node_robot_state_publisher,
                # On attend encore 3s que l'arbre TF soit stable avant de spawn
                TimerAction(
                    period=3.0,  
                    actions=[
                        spawn_entity,
                        LogInfo(msg='✅ Robot Spawné ! Lancez maintenant le fichier de navigation.')
                    ]
                )
            ]
        ),
    ])
