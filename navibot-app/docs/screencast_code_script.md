# Script Screencast — Explication du code (2.6)

**Durée estimée** : 10-15 minutes
**Public** : Encadrants, membres du jury, développeurs

---

## Introduction (1 min)

> Bonjour, je vais vous présenter le code source du projet NaviBot. Ce projet concerne le développement d'une application de contrôle et de navigation autonome pour un robot mobile en environnement hospitalier, utilisant ROS 2 pour la simulation et React/TypeScript pour l'interface utilisateur.

---

## Partie 1 : Architecture générale du code (2 min)

> L'application se divise en deux grandes parties :
>
> **1. L'application web/desktop** dans le dossier `navibot-app/`, écrite en React et TypeScript. Elle communique avec le robot via WebSocket en utilisant la bibliothèque roslib.js.
>
> **2. Le workspace ROS 2** dans `src/navibot_description/`, qui contient les fichiers de lancement, la configuration des paramètres Nav2, la description URDF du robot, et la carte hospitalière.
>
> Le point d'entrée de l'application est `src/main.tsx` qui monte le composant principal `App.tsx`. L'état global est géré avec la bibliothèque Zustand. Les stores sont :
> - `connectionStore` : gère la connexion WebSocket
> - `navStore` : gère l'état de la navigation autonome
> - `roomsStore` : gère la liste des salles de destination
> - `authStore` : gère l'authentification admin

---

## Partie 2 : Communication ROS (3 min)

> Ouvrons maintenant le dossier `src/ros/` qui contient la couche de communication avec ROS.
>
> **`bridge.ts`** est le cœur de la communication. C'est un singleton qui encapsule la connexion WebSocket via `ROSLIB.Ros`. Il expose une méthode `connect(url)` qui établit la connexion, et un système d'observateurs via `onStatus(callback)` pour notifier les changements d'état : connected, connecting, disconnected, error. Il intègre aussi une reconnexion automatique toutes les 3 secondes en cas de perte de connexion.
>
> **`cmdVel.ts`** publie les commandes de vitesse sur le topic `/cmd_vel`. La fonction `publishCmdVel(linear, angular)` publie un message `geometry_msgs/Twist`. Le joystick l'appelle à 20 Hz. La fonction `stopRobot()` est utilisée pour l'arrêt d'urgence.
>
> **`navigation.ts`** contient trois fonctions essentielles pour la navigation autonome :
> - `navigateToPose(x, y, yaw)` : envoie un objectif à l'action ROS `NavigateToPose`. Elle construit un message avec la pose cible et un timestamp courant, puis retourne l'ID de l'objectif pour permettre l'annulation.
> - `cancelNavigation(id)` : annule un objectif en cours.
> - `getRobotPose()` : utilise le client TF pour récupérer la transformation `map → base_footprint` et en déduire la position du robot.
>
> Toutes ces fonctions vérifient d'abord que la connexion ROS est active avant d'opérer.

---

## Partie 3 : Stores et état global (2 min)

> Les stores Zustand sont dans `src/store/`. 
>
> **`connectionStore.ts`** persiste l'URL du robot dans `localStorage`. Il s'abonne aux changements de statut du bridge ROS et expose les actions `connect` et `disconnect`. Une auto-connexion est déclenchée au chargement de l'application.
>
> **`navStore.ts`** gère l'état de navigation via un `discriminated union type` NavStatusType. Il a cinq états : idle, navigating, succeeded, failed, cancelled. La méthode `sendGoal` annule d'abord tout objectif en cours, puis en envoie un nouveau. Le feedback distance_remaining est mis à jour à chaque retour de l'action ROS.
>
> **`roomsStore.ts`** est un simple CRUD persistant. Il inclut `setRoomsFromJSON` pour l'import/export.
>
> **`authStore.ts`** vérifie un PIN (défini via variable d'environnement) pour passer en mode admin.

---

## Partie 4 : Composants React (3 min)

> Les composants sont dans `src/components/`.
>
> **`ConnectionBar.tsx`** : barre tout en haut de l'écran. Elle affiche un point coloré selon l'état de connexion (vert = connecté, jaune = connexion en cours, rouge = erreur, gris = déconnecté). Un bouton Configure ouvre une modale pour saisir l'URL WebSocket.
>
> **`Joystick.tsx`** : joystick tactile en pur React, sans bibliothèque externe. Il utilise les événements Pointer Events pour le toucher et la souris. La position du doigt est normalisée entre -1 et 1 sur chaque axe, avec une zone morte de 7% pour éviter les petites vibrations. Un timer setInterval publie la vitesse à 20 Hz. Si le robot était en navigation autonome, le joystick l'interrompt automatiquement.
>
> **`AdminPanel.tsx`** : panneau d'administration pour gérer les salles. Il permet d'ajouter, modifier, supprimer des salles, et de récupérer la position actuelle du robot via TF. L'export utilise la Web Share API si disponible, sinon le presse-papier, sinon une zone de texte. L'import se fait via un sélecteur de fichier JSON.
>
> **`RoomPanel.tsx`** : grille de boutons pour sélectionner une salle de destination. Les boutons sont désactivés pendant la navigation.
>
> Les autres composants (`NavStatus`, `SpeedControl`, `LoginModal`) sont des composants purement d'affichage ou de formulaire, sans logique métier complexe.

---

## Partie 5 : ROS 2 et Nav2 (3 min)

> Dans le workspace ROS, le fichier `nav2.launch.py` orchestre le lancement de la navigation. Il inclut la localisation (AMCL) et la navigation (BT Navigator, MPPI Controller) depuis `nav2_bringup`, et force `use_sim_time=true` pour la simulation.
>
> Le fichier `nav2_params.yaml` contient tous les paramètres de Nav2. Les plus importants sont :
> - Le contrôleur MPPI avec `iteration_count: 5` et `retry_attempt_limit: 5` pour une optimisation robuste
> - Le progress checker avec `movement_time_allowance: 30s`
> - Les costmaps locale et globale avec `inflation_radius: 0.60m`
>
> Le fichier `navibot.urdf.xacro` décrit le robot : 4 roues motrices (skid-steer), un LiDAR 360°, un LiDAR incliné à l'avant pour détecter les obstacles bas, une caméra RGB, et une IMU. Deux plugins diff_drive sont utilisés : un pour les roues avant (qui publie l'odométrie) et un pour les roues arrière (sans odométrie, pour éviter les conflits).

---

## Conclusion (1 min)

> En résumé, le code est organisé de manière modulaire avec une séparation claire entre la couche de communication ROS, la gestion d'état, et l'interface utilisateur. Chaque fichier a une responsabilité unique, ce qui facilite la maintenance et l'évolution du projet. Les commentaires dans le code décrivent le rôle de chaque fonction et les choix d'implémentation.
>
> Le code source complet est disponible sur GitHub à l'adresse : https://github.com/github123ko67jj/ros2
>
> Merci de votre attention.

---

## Conseils pour l'enregistrement

- **Outil recommandé** : OBS Studio (gratuit, open-source)
- **Cadrage** : 1920×1080, éditeur de code à gauche (VS Code), terminal à droite si besoin
- **Fichiers à montrer** :
  1. `src/ros/bridge.ts` — le pont de connexion
  2. `src/ros/navigation.ts` — les actions ROS
  3. `src/components/Joystick.tsx` — le joystick tactile
  4. `src/components/AdminPanel.tsx` — la gestion des salles
  5. `src/store/navStore.ts` — le store de navigation
  6. `launch/nav2.launch.py` — le lancement Nav2
  7. `config/nav2_params.yaml` — les paramètres
  8. `urdf/navibot.urdf.xacro` — la description du robot
- **Rythme** : 1 à 2 minutes par fichier, pas de précipitation
- **Langue** : français ou anglais selon votre jury
