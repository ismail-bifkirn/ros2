# Script Vidéo — Présentation de l'application NaviBot (2.8)

**Durée estimée** : 5-8 minutes
**Format** : Démo en direct de l'application (Android + Windows)

---

## Introduction (30s)

> Bonjour, je vais vous présenter NaviBot, une application de contrôle et de navigation autonome pour robot mobile en environnement hospitalier.
>
> L'application permet deux modes principaux : le contrôle manuel via un joystick tactile, et la navigation autonome vers des salles prédéfinies.

---

## Partie 1 : Connexion au robot (1 min)

> **[Montrer l'écran d'accueil de l'application]**
>
> Une fois l'application lancée, la barre de statut en haut indique l'état de la connexion. Initialement, elle est en gris : "Disconnected".
>
> **[Cliquer sur "Configure"]**
>
> Je clique sur Configure pour entrer l'URL du robot. En local, c'est `ws://localhost:9090`. À distance, on peut utiliser un tunnel comme localhost.run. Je valide avec Connect.
>
> **[Montrer le point qui devient vert]**
>
> Le point passe au vert : "Connected". L'application est maintenant connectée au robot.

---

## Partie 2 : Contrôle manuel (1 min 30s)

> **[Aller dans l'onglet Drive]**
>
> L'onglet Drive est le mode de contrôle manuel. On voit le joystick circulaire et les réglages de vitesse.
>
> **[Montrer le joystick : toucher et glisser]**
>
> Le joystick fonctionne au toucher et à la souris. Plus on s'éloigne du centre, plus le robot va vite. La direction verticale contrôle l'avancement, l'horizontale la rotation. Il y a une petite zone morte au centre pour éviter les commandes parasites.
>
> **[Montrer les curseurs de vitesse]**
>
> En dessous, les curseurs permettent de limiter la vitesse linéaire et angulaire du robot. Utile pour les déplacements de précision.
>
> **[Montrer le relâcher]**
>
> Quand je relâche le joystick, le robot s'arrête immédiatement.

---

## Partie 3 : Navigation autonome (2 min)

> **[Aller dans l'onglet Navigate]**
>
> L'onglet Navigate affiche la liste des salles sous forme de grille. Chaque salle a un nom, une icône et des coordonnées.
>
> **[Cliquer sur une salle]**
>
> Je clique sur "Reception" par exemple. L'application envoie un objectif de navigation au robot via l'action ROS `NavigateToPose`.
>
> **[Montrer le statut qui change]**
>
> La barre de statut devient bleue : "Navigating to Reception". On voit la distance restante qui diminue au fur et à mesure que le robot avance.
>
> **[Si possible, montrer Gazebo/RViz en parallèle]**
>
> *(Si la vidéo le permet)* Voici ce qu'il se passe côté ROS : Nav2 planifie un chemin global, puis le contrôleur MPPI calcule les commandes de vitesse pour suivre le chemin tout en évitant les obstacles.
>
> **[Montrer l'arrivée]**
>
> Quand le robot arrive, le statut passe au vert : "Arrived at Reception". Puis il revient automatiquement à l'état de repos après 3 secondes.
>
> **[Montrer le bouton Cancel]**
>
> Pendant la navigation, on peut annuler à tout moment avec le bouton "Cancel". Le robot s'arrête et le statut passe en "Cancelled".

---

## Partie 4 : Administration — Gestion des salles (1 min 30s)

> **[Passer en mode admin : cliquer sur Admin, entrer le PIN]**
>
> Pour accéder aux fonctions d'administration, je clique sur Admin et j'entre le code PIN. Un badge "ADMIN" apparaît dans l'en-tête.
>
> **[Aller dans l'onglet Admin]**
>
> L'onglet Admin s'affiche. Je vois la liste des salles avec leurs coordonnées et les boutons pour modifier ou supprimer.
>
> **[Ajouter une salle]**
>
> Je clique sur "Add Room". Un formulaire s'ouvre pour saisir le nom, les coordonnées X, Y, Yaw, et une icône.
>
> **[Utiliser la position actuelle]**
>
> Une fonction intéressante : "Use Current Robot Position". Elle récupère la position du robot sur la carte via le système de TF de ROS et remplit automatiquement les champs. Très pratique pour ajouter une salle à l'endroit où le robot se trouve.
>
> **[Exporter les salles]**
>
> Le bouton Export sauvegarde la liste des salles au format JSON — soit via le partage Android, soit dans le presse-papier.
>
> **[Importer]**
>
> L'Import permet de charger un fichier JSON, utile pour synchroniser les salles entre plusieurs appareils.

---

## Partie 5 : Déploiement multiplateforme (1 min)

> L'application est développée en React et TypeScript avec Vite. Elle se déploie sur trois plateformes :
>
> **Android** : via Capacitor, l'application est empaquetée en APK. Elle fonctionne comme une application native avec accès aux API du téléphone.
>
> **Windows** : via Electron, elle s'emballe en un installeur NSIS. Lancez `NaviBot Setup 0.0.0.exe` sur n'importe quel PC Windows, et l'application s'installe.
>
> **Linux** : via Electron, en AppImage ou .deb.
>
> Dans tous les cas, le code source est le même. Seule la couche de packaging change.

---

## Conclusion (30s)

> NaviBot est une solution complète et multiplateforme pour le contrôle de robots mobiles. Elle combine la puissance de ROS 2 pour la navigation autonome avec la flexibilité d'une interface web moderne en React.
>
> Le code source est disponible sur GitHub. Merci de votre attention, je suis disponible pour répondre à vos questions.

---

## Conseils pour l'enregistrement

- **Outil recommandé** : OBS Studio ou l'enregistreur d'écran de votre téléphone
- **Pour l'application Android** : Utilisez un enregistreur d'écran intégré ou l'application "Screen Recorder"
- **Pour l'application Windows** : OBS Studio, capture de fenêtre
- **Pour montrer Gazebo/RViz en parallèle** : utilisez OBS avec plusieurs sources (split screen)
- **Rythme** : parlez lentement, montrez chaque action avant de l'expliquer
- **Son** : micro correct si possible, évitez le bruit ambiant
- **Si quelque chose ne marche pas en direct** : enregistrez chaque partie séparément et montez la vidéo
