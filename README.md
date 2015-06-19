


# Instructions
_forgive me, those instructions are written in french_





# Démarrage

```bash
cd stalker_ws/src/stalker

# Lancement des processus 
./launch
```

# Ouverture de l'interface web
![](res/qrcode_openiface.png)

# Résolution de problèmes

0. Si la connexion au Wifi bloque sur "Attribution de l'adresse IP", lancer `sudo service isc-dhcp-server start`
0. Si la caméra n'est pas contrôlable
  - Stopper les processus ROS
  - Déconnecter l'arduino
  - Reconnecter l'arduino
  - `sudo chmod a+rw /dev/ttyACM?`
  - Relancer les process ROS (via `launch`)

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
- Adresse de la borne: `192.168.0.254`
- Utilisateur: `administrateur`
- Mot de passe: même que celui par défaut des comptes isen

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
Le programme d'arduino est dans `res/arduino_serial.ino`
