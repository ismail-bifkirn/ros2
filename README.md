[README.md](https://github.com/user-attachments/files/32435839/README.md)
# Navibot — ROS2 humble

Projet robotique mobile combinant un système **ROS2** (description et navigation du robot) et une **application Android/mobile** de contrôle, avec communication en temps réel via WebSocket (rosbridge).

## 📁 Structure du dépôt

```
ros2/
├── android/                   # Application Android (contrôle / interface du robot)
├── navibot-app/                # Application compagnon (mobile)
├── src/
│   └── navibot_description/    # Package ROS2 : description du robot (URDF/Xacro, meshes, etc.)
├── ws_test.html                # Page de test de connexion WebSocket vers rosbridge
├── LICENSE                     # Licence Apache 2.0
└── .gitignore
```

## 🤖 À propos

Navibot est un robot de navigation autonome développé et testé dans un **environnement virtuel** (simulation). Il vise à terme des cas d'usage réels tels que la navigation en **milieu hospitalier** (déplacement autonome dans les couloirs, évitement d'obstacles, etc.).

## 🎥 Démonstrations vidéo

| | | |
|---|---|---|
| [![Démo 1](https://img.youtube.com/vi/vqQhvCHPxms/0.jpg)](https://youtu.be/vqQhvCHPxms) | [![Démo 2](https://img.youtube.com/vi/ormdmfxdzJU/0.jpg)](https://youtu.be/ormdmfxdzJU) | [![Démo 3](https://img.youtube.com/vi/7mpFC5ZbU6U/0.jpg)](https://youtu.be/7mpFC5ZbU6U) |
| [![Démo 4](https://img.youtube.com/vi/Wp1c9RhAP8k/0.jpg)](https://youtu.be/Wp1c9RhAP8k) | [![Démo 5](https://img.youtube.com/vi/2pSd0y77PeA/0.jpg)](https://youtu.be/2pSd0y77PeA) | [![Démo 6](https://img.youtube.com/vi/rC9FLKSUU_Y/0.jpg)](https://youtu.be/rC9FLKSUU_Y) |
| [![Démo 7](https://img.youtube.com/vi/YpcjWbYKOo0/0.jpg)](https://youtu.be/YpcjWbYKOo0) | | |

*(cliquer sur une miniature pour ouvrir la vidéo sur YouTube)*

## 🧩 Composants

- **`src/navibot_description`** : package ROS2 contenant la description physique du robot (liens, joints, capteurs) utilisée pour la simulation et/ou la visualisation (RViz, Gazebo).
- **`navibot-app`** : application permettant de piloter/superviser le robot.
- **`android`** : application Android associée au projet.
- **`ws_test.html`** : petit script HTML/JS autonome permettant de tester rapidement la connexion WebSocket au serveur **rosbridge** tournant sur le robot (`ws://<IP_DU_ROBOT>:9090`), avant d'intégrer la communication dans l'application.

## ⚙️ Prérequis

- **ROS2 Humble**
- `rosbridge_server` (pour la communication WebSocket avec les applications client)
- Android Studio (pour compiler l'application Android)

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/ismail-bifkirn/ros2.git
cd ros2

# Construire le workspace ROS2
colcon build
source install/setup.bash
```

## ▶️ Utilisation

1. Lancer le serveur rosbridge sur le robot :
   ```bash
   ros2 launch rosbridge_server rosbridge_websocket_launch.xml
   ```
2. Vérifier la connexion avec `ws_test.html` (ouvrir le fichier dans un navigateur, en adaptant l'adresse IP du robot dans le script).
3. Lancer l'application (`navibot-app` ou l'application Android) pour piloter le robot.

<!-- TODO : commandes précises de lancement (voir remarque ci-dessous) -->

## 📄 Licence

Ce projet est distribué sous licence **Apache 2.0** — voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ✍️ Auteur

Ismail — [ismail-bifkirn](https://github.com/ismail-bifkirn)
