// Types partagés pour l'application NaviBot
// Centralisés ici pour éviter les dépendances circulaires

// Représente une salle de destination avec sa pose sur la carte
export interface Room {
  id:    string;   // identifiant unique (UUID)
  name:  string;   // nom lisible (ex: "Réception", "Salle 101")
  x:     number;   // position X en mètres sur la carte
  y:     number;   // position Y en mètres sur la carte
  yaw:   number;   // orientation en radians
  icon?: string;   // emoji optionnel pour l'affichage
}

// État de la navigation, exprimé comme un discriminated union type
// Permet de représenter proprement les différents états sans états invalides
export type NavStatusType =
  | { type: 'idle' }                                              // aucun objectif actif
  | { type: 'navigating'; roomName: string; distance?: number }  // en cours
  | { type: 'succeeded'; roomName: string }                      // arrivé à destination
  | { type: 'failed';    roomName: string; reason?: string }     // échec
  | { type: 'cancelled' };                                        // annulé par l'utilisateur

// Limites de vitesse pour le mode manuel
export interface SpeedLimits {
  linear:  number;  // vitesse linéaire max (m/s)
  angular: number;  // vitesse angulaire max (rad/s)
}

// État de la connexion WebSocket au robot
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
// Rôle de l'utilisateur (admin peut gérer les salles)
export type UserRole = 'user' | 'admin';
