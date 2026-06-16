# Fiche documentaire du code — NaviBot

## 1. Présentation générale

**Projet** : NaviBot — Application de contrôle et navigation autonome d'un robot mobile
**Technologies** : ROS 2 Humble (C++/Python) + React 19 + TypeScript + Capacitor (Android) + Electron (Windows)
**Communication** : WebSocket via rosbridge_server (port 9090)
**Simulation** : Gazebo 11 avec monde hospitalier

**Architecture** :
```
Application Web/Desktop (React + TypeScript)
    ↕ WebSocket (roslib.js)
rosbridge_server
    ↕ ROS 2
Nav2 (localisation + planification + contrôle) + Gazebo (simulation)
```

---

## 2. Structure du code

### 2.1 Application React (navibot-app/)

```
src/
├── main.tsx              # Point d'entrée React
├── App.tsx               # Composant principal (onglets Drive/Navigate/Admin)
├── index.css             # Styles Tailwind CSS
├── types/
│   └── index.ts          # Types partagés (Room, NavStatus, SpeedLimits...)
├── store/
│   ├── authStore.ts      # Authentification admin (PIN)
│   ├── connectionStore.ts # Connexion WebSocket ROS
│   ├── navStore.ts       # État de navigation autonome
│   └── roomsStore.ts     # CRUD salles de destination
├── ros/
│   ├── bridge.ts         # Pont WebSocket vers rosbridge (singleton)
│   ├── cmdVel.ts         # Publication des commandes de vitesse (/cmd_vel)
│   └── navigation.ts     # Actions ROS (NavigateToPose, TF)
└── components/
    ├── AdminPanel.tsx     # Gestion des salles (admin)
    ├── ConnectionBar.tsx  # Barre de connexion WebSocket
    ├── Joystick.tsx       # Joystick tactile
    ├── LoginModal.tsx     # Modale d'authentification
    ├── NavStatus.tsx      # Statut de navigation
    ├── RoomPanel.tsx      # Sélection de salle (mode navigation)
    └── SpeedControl.tsx   # Contrôle des limites de vitesse
```

### 2.2 ROS 2 (src/navibot_description/)

```
├── launch/
│   ├── gazebo.launch.py  # Lancement Gazebo + spawn robot
│   ├── nav2.launch.py    # Lancement Nav2 (localisation + navigation)
│   └── slam.launch.py    # Lancement SLAM Toolbox
├── config/
│   ├── nav2_params.yaml  # Paramètres Nav2 (MPPI, costmaps, AMCL...)
│   ├── slam_params.yaml  # Paramètres SLAM Toolbox
│   └── controllers.yaml  # Configuration ros2_control (pour migration future)
├── urdf/
│   └── navibot.urdf.xacro # Description du robot (4 roues, LiDARs, caméra, IMU)
├── maps/
│   ├── ma_carte.yaml     # Metadata de la carte hospitalière
│   └── ma_carte.pgm      # Image de la carte (1252×2806 px)
├── rviz/
│   └── navibot.rviz      # Configuration RViz
├── setup.py              # Package ROS
└── package.xml           # Dépendances ROS
```

---

## 3. Flux de données

### 3.1 Connexion
```
App → WebSocket → rosbridge_server → ROS 2 topics/services/actions
```

### 3.2 Contrôle manuel (Drive)
```
Joystick tactile → publishCmdVel() → /cmd_vel → Gazebo (diff_drive plugin)
```

### 3.3 Navigation autonome (Navigate)
```
RoomPanel (clic salle) → navigateToPose() → /navigate_to_pose (action)
    → Nav2 (BT Navigator) → /cmd_vel_nav → /cmd_vel → robot
    ↕ feedback (distance restante)
```

### 3.4 Position robot
```
getRobotPose() → TF Client (map → base_footprint)
```

---

## 4. Dépendances principales

### Application
- **React 19** — UI
- **TypeScript 6** — Langage typé
- **Zustand** — Gestion d'état (stores)
- **roslib.js 2.1** — Client ROS via WebSocket
- **Vite 8** — Build tool
- **Tailwind CSS 3** — Styles
- **Capacitor 8** — Android native
- **Electron 41** — Desktop Windows

### ROS 2
- **nav2_bringup** — Navigation stack
- **nav2_mppi_controller** — Planificateur local (MPPI)
- **slam_toolbox** — SLAM (optionnel)
- **gazebo_ros** — Simulation
- **robot_state_publisher** — TF
- **rosbridge_server** — Pont WebSocket

---

## 5. Installation et exécution

### PC robot (Ubuntu 22.04 + ROS 2 Humble)
```bash
# Terminal 1 : Simulation
~/launch_gazebo.sh

# Terminal 2 : Navigation
~/launch_nav2.sh

# Terminal 3 : Pont WebSocket
~/launch_bridge.sh
```

### Application (Windows / Android)
```bash
cd ~/navibot-app
npm install
npm run dev          # Développement (http://localhost:5173)
npm run electron:build-linux  # Build Electron Linux
npm run electron:build -- --win  # Build Windows
npx cap sync && npx cap open android  # Build Android
```

### Connexion
Ouvrir l'application → Configure → URL WebSocket :
- Local : `ws://localhost:9090`
- Réseau : `ws://192.168.1.XXX:9090`
- Distance : `wss://XXXX.lhr.life` (via localhost.run)

---

## 6. Configuration clé (nav2_params.yaml)

| Paramètre | Valeur | Rôle |
|-----------|--------|------|
| iteration_count | 5 | Itérations de l'optimiseur MPPI |
| retry_attempt_limit | 5 | Tentatives max de replanification |
| vx_max | 0.30 m/s | Vitesse linéaire max |
| wz_max | 1.4 rad/s | Vitesse angulaire max |
| movement_time_allowance | 30 s | Timeout du progress checker |
| xy_goal_tolerance | 0.25 m | Tolérance position objectif |
| inflation_radius | 0.60 m | Rayon d'inflation des obstacles |

---

## 7. Capteurs du robot

| Capteur | Topic | Rôle |
|---------|-------|------|
| LiDAR principal (360°) | `/scan` | Navigation, cartographie |
| LiDAR bas incliné (180°) | `/scan_obstacles_bas` | Détection obstacles bas |
| Caméra RGB | `/camera/image_raw` | Visualisation |
| IMU | `/imu` | Orientation (non utilisé actuellement) |

---
*Document généré le 09/06/2026 — Projet NaviBot*
