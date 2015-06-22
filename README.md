


# Instructions
_forgive me, those instructions are written in french_





# Démarrage

```bash
cd stalker_ws/src/stalker

# Lancement des processus 
./launch
```

# Ouverture de l'interface web
![http://192.168.0.1/](res/qrcode_openiface.png)

http://192.168.0.1/

# Résolution de problèmes

0. Si la connexion au Wifi bloque sur "Attribution de l'adresse IP", lancer `sudo service isc-dhcp-server start`
0. Si la caméra n'est pas contrôlable
  - Stopper les processus ROS
  - Déconnecter l'arduino
  - Reconnecter l'arduino
  - `sudo chmod a+rw /dev/ttyACM?`
  - Relancer les process ROS (via `launch`)

# Streaming audio (optionnel)

Le streaming audio n'est pas inclus dans la page de contrôle, il faut installer une application tierce.

Le turtlebot embarque un serveur Mumble, qu'on peut lancer avec la commande `murmurd`.

Une fois le serveur lancé, il faut connecter le robot en lançant l'application Mumble sur le robot, et en se connectant à l'IP `127.0.0.1`

Le client peut ensuite s'y connecter via un client mumble (Mumble sur PC, Plumble sur Android) en saisissant l'adresse `192.168.0.1`.

Attention au larcen si le client est trop proche du robot. Il est préférable de couper le micro du client, et de parler via la synthèse vocale de l'application de contrôle.


-------

# Développement
Le développement se fait de préférence sur le PC du turtlebot, ou via un montage réseau type `sshfs`
```bash
cd stalker_ws/src/stalker

# Compilation
make

# Voir le fichier launch pour lancer un processus séparément
# ex:
rosrun stalker camctrl /dev/ttyACM?
```

# Réseau Wifi
### Administration
Nom|Valeur
---|---
Adresse de la borne |`192.168.0.254`
Utilisateur|`administrateur`
Mot de passe|même que celui par défaut des comptes isen

### Ports
Port|Utilisation
---|---
80|Page HTTP de l'application
8082|Streaming vidéo
9090|Contrôle de ROS via l'application
64738|Streaming audio Mumble

# Installation des logiciels sur le turtlebot (déja fait)

### ROS
Voir le [wiki de ROS](http://wiki.ros.org/Robots/TurtleBot) pour les instructions pour installer et configurer ROS
```bash
# Installation de rosbridge, pour le requêtage en javascript
sudo apt-get install ros-hydro-rosbridge-suite
```

### Streaming video
- Installer [jsmpeg](https://github.com/phoboslab/jsmpeg) dans le home de l'utilisateur
- Installer ffmpeg, node

### Arduino
Le programme d'arduino est [`res/arduino_serial.ino`](res/arduino_serial.ino)
