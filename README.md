# NaviBot — Robot mobile de navigation autonome

Projet de Master en robotique mobile. Simulation complète d'un robot
quatre roues (skid-steer) naviguant de façon autonome dans un environnement
hospitalier sous **ROS 2 Humble** et **Gazebo Classic**.

---

## Aperçu

NaviBot embarque :

- Un **LiDAR 2D 360°** (`/scan`, portée 12 m) pour la cartographie et la
  localisation principale.
- Un **LiDAR 2D incliné vers l'avant** (`/scan_obstacles_bas`, pitch +0.2 rad,
  portée 2 m) pour la détection d'obstacles bas (objets posés au sol,
  marches, animaux).
- Une **caméra RGB** (`/camera/image_raw`) pour la perception visuelle.
- Une **IMU** (`/imu`) pour aider à l'estimation d'attitude.
- Quatre **roues motrices** en configuration skid-steer.

La pile logicielle utilise :

| Composant       | Rôle                                                 |
|-----------------|------------------------------------------------------|
| Gazebo Classic  | Simulation physique + capteurs                       |
| `slam_toolbox`  | Cartographie SLAM en ligne                           |
| `nav2_bringup`  | Localisation (AMCL), planification, contrôle         |
| `robot_localization` | Fusion EKF odom + IMU (configurable, voir TODO) |
| RViz2           | Visualisation                                        |

---

## Architecture des frames TF

```
map ──► odom ──► base_footprint ──► base_link ──► {capteurs, roues}
 (AMCL)  (gazebo_ros_diff_drive)        (URDF fixe)
```

Les capteurs (LiDARs, caméra, IMU) sont attachés à `base_link` via des
joints fixes définis dans `urdf/navibot.urdf.xacro`.

---

## Prérequis

- Ubuntu 22.04
- ROS 2 Humble
- Gazebo Classic 11
- Packages :
  ```bash
  sudo apt install \
    ros-humble-nav2-bringup \
    ros-humble-slam-toolbox \
    ros-humble-robot-localization \
    ros-humble-gazebo-ros-pkgs \
    ros-humble-xacro
  ```

Le monde « hospital » provient du dépôt
[`aws-robotics/aws-robomaker-hospital-world`](https://github.com/aws-robotics/aws-robomaker-hospital-world)
inclus en submodule.

---

## Installation

```bash
# 1. Cloner le dépôt avec ses submodules
git clone --recurse-submodules https://github.com/github123ko67jj/ros2.git ros2_ws
cd ros2_ws

# (Si le clone est déjà fait sans --recurse-submodules:)
# git submodule update --init --recursive

# 2. Préparer le monde hospital (suit le README du submodule)
cd src/aws-robomaker-hospital-world
bash setup.sh
cd ../..

# 3. Compiler le paquet
colcon build --packages-select navibot_description
source install/setup.bash
```

---

## Utilisation

### Lancer la simulation et la navigation

**Terminal 1 — Gazebo + le robot :**
```bash
source install/setup.bash
ros2 launch navibot_description gazebo.launch.py
```
Attendre le message `✅ Robot Spawné !`.

**Terminal 2 — Nav2 + RViz :**
```bash
source install/setup.bash
ros2 launch navibot_description nav2.launch.py
```

La pose initiale est déjà fixée dans `config/nav2_params.yaml`
(`amcl.set_initial_pose: true`, x=5.0, y=3.0) et correspond à la position
de spawn du robot. Aucun **2D Pose Estimate** manuel n'est nécessaire.

Dans RViz, cliquer directement sur **2D Goal Pose** pour fixer une
destination ; le robot doit planifier et exécuter une trajectoire.

### Construire une carte (SLAM)

Pour explorer une nouvelle zone et créer la carte :

```bash
# Terminal 1
ros2 launch navibot_description gazebo.launch.py

# Terminal 2
ros2 launch navibot_description slam.launch.py

# Terminal 3 — téléopération clavier
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

Une fois la carte satisfaisante, la sauvegarder :
```bash
ros2 run nav2_map_server map_saver_cli -f ~/ros2_ws/src/navibot_description/maps/ma_carte
```

---

## Topics principaux

| Topic                          | Type                       | Source           |
|--------------------------------|----------------------------|------------------|
| `/scan`                        | `sensor_msgs/LaserScan`    | LiDAR 360°       |
| `/scan_obstacles_bas`          | `sensor_msgs/LaserScan`    | LiDAR incliné    |
| `/odom`                        | `nav_msgs/Odometry`        | diff_drive plugin|
| `/imu`                         | `sensor_msgs/Imu`          | Plugin IMU       |
| `/camera/image_raw`            | `sensor_msgs/Image`        | Caméra RGB       |
| `/cmd_vel`                     | `geometry_msgs/Twist`      | Nav2 → robot     |
| `/map`                         | `nav_msgs/OccupancyGrid`   | map_server       |

---

## Fichiers de configuration clés

| Chemin                                | Rôle                                          |
|---------------------------------------|-----------------------------------------------|
| `urdf/navibot.urdf.xacro`             | Description physique du robot                 |
| `config/nav2_params.yaml`             | Paramètres complets de la pile Nav2           |
| `config/slam_params.yaml`             | Paramètres slam_toolbox                       |
| `config/ekf.yaml`                     | Configuration EKF (non câblé par défaut)      |
| `config/controllers.yaml`             | Config ros2_control (non câblé par défaut)    |
| `maps/ma_carte.yaml`                  | Carte par défaut chargée par AMCL             |
| `rviz/navibot.rviz`                   | Configuration de visualisation RViz           |

---

## Dépannage

### Le `map_server` échoue à charger la carte
Vérifier que `maps/ma_carte.yaml` et `maps/ma_carte.pgm` existent dans
`install/navibot_description/share/navibot_description/maps/` après
`colcon build`. Sinon, relancer un build propre :
```bash
rm -rf build/ install/ log/
colcon build --packages-select navibot_description
```

### Gazebo ne trouve pas les modèles du monde hospital
S'assurer que `setup.sh` du submodule `aws-robomaker-hospital-world` a
bien été exécuté pour générer `worlds/hospital.sdf` et télécharger les
modèles dans `models/` et `fuel_models/`.

### Le LiDAR incliné ne pointe pas vers le bas
Si une modification du joint `lidar_obstacles_bas_joint` semble ignorée
en simulation, c'est dû au *fixed-joint lumping* de Gazebo. Le tag
`<preserveFixedJoint>true</preserveFixedJoint>` est déjà appliqué dans
l'URDF pour empêcher ce comportement.

### Le robot ne bouge pas
Vérifier que `/cmd_vel` reçoit bien des commandes :
```bash
ros2 topic echo /cmd_vel
```
Et que le plugin `gazebo_ros_diff_drive` est bien chargé (le voir dans
les logs Gazebo au démarrage).

---

## Améliorations en cours / TODO

- Activer la fusion EKF (`ekf.yaml` prêt, à lancer dans un launch dédié).
- Migrer de `gazebo_ros_diff_drive` vers `ros2_control` + skid_steer
  4-roues pour un contrôle plus réaliste.
- Documenter les performances de navigation (temps de planification,
  succès sur scénarios types).

---

## Licence

Distribué sous licence **Apache 2.0**. Voir le fichier [`LICENSE`](LICENSE)
pour le texte intégral.

## Auteur

**Ismail** — Projet de Master en robotique mobile, 2026.
