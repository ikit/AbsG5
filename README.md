# AbsG5

5ème version du site web familliale Absolument G. Cette version se base côté serveur sur [NodeJS](https://nodejs.org/en/) ([express](https://expressjs.com/fr/)), une base de donnée [postgreSQL](https://www.postgresql.org/) et un client web [pwa](https://progressive-web-apps.fr/definition-progressive-web-apps-pwa) utilisant la librairie [Vue.js](https://vuejs.org/) et [Vuetify](https://vuetifyjs.com/en).


| Tâche         | Statut          | Progression |
| ------------- |:-------------|:--------------|
| [Serveur](https://github.com/ikit/AbsG5)       | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/6206e134936040318fee348b18de3486)](https://www.codacy.com/app/Ikit/AbsG5?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ikit/AbsG5&amp;utm_campaign=Badge_Grade) [![Build Status](https://travis-ci.org/ikit/AbsG5.svg?branch=master)](https://travis-ci.org/ikit/AbsG5) | Alpha [10%](https://github.com/ikit/AbsG5/milestone/1) |
| [AGPA Ceremony](https://github.com/ikit/AGPACeremony)        |  \[Codacy Badge] \[Build Status] | 0% |
| [Doc](http://absg5.readthedocs.io/fr/latest/)           | [![Documentation Status](https://readthedocs.org/projects/absg5/badge/?version=latest)](http://absg5.readthedocs.io/fr/latest/?badge=latest) | 10% |

## Présentation



## Fonctionnalités
- Basé sur NextCloud:
  - Gestion des utilisateurs et authentification
  - Partage de fichiers
  - Calendrier partagé
- Citations 
- Image du moment
- Files de discussion (forum/chat)
- A.G.P.A
- ...



## Installation

### 1- Prérequis
- docker
- docker-compose
- nginx
- git
- `sudo mkdir /var/absg5/git && sudo chown -r ${UID}:${GID} /var/absg5`
- `cd /var/absg5/git`
- `git clone https://github.com/ikit/AbsG5.git`

### 2- NextCloud

**Mise en place des containers Docker**

- `cd /var/absg5/git/Absg5/install`
- personnaliser le fichier `absg_nextcloud.yml` selon vos préférences (changer en particulier les [mots de passes](https://passwordsgenerator.net/))
  - `MYSQL_ROOT_PASSWORD`
  - `MYSQL_PASSWORD`
- `docker-compose -f absg_nextcloud.yml up -d`: pour créer et démarrer les containers
- `docker-compose -f absg_nextcloud.yml down`: pour tuer et arrêter les containers sans perdre les données. 
- `docker-compose -f absg_nextcloud.yml down --volumes`: pour supprimer tout (y compris les données stocké sur le serveur)
- `curl localhost:10011`: pour vérifier que nextcloud répond bien sur le port prévu


**Configuration NginX et SSL via Let's Encrypt**

- `sudo apt install letsencrypt -y`: installation des outils Let's Encrypt
- `sudo /etc/init.d/nginx stop`: on arrête nginx le temps de la manoeuvre
- `sudo letsencrypt certonly --standalone -d cloud.absolumentg.fr`: on génère un certificat pour l'accès direct au cloud' 
- Une fois accepté les conditions, et fourni un email, le certificat est généré dans le répertoire `/etc/letsencrypt/live/cloud.absolumentg.fr`
- `sudo cp ./nginx_absg5_cloud /etc/nginx/sites-available/absg5_cloud`: on copie le fichier conf nginx (penser à modifier l'emplacement des certificats et du nom de domaine si besoin)
- `sudo ln -s /etc/nginx/sites-available/absg5_cloud /etc/nginx/sites-enabled/absg5_cloud`: on indique à nginx que cette configuration est active
- `sudo /etc/init.d/nginx start`: on redémarre nginx, et on peut tester via son navigateur que le site est accessible

**Configuration de NextCloud**

- La première chose à faire est de créer un compte admin
- login: Admin
- mdp : [mots de passes](https://passwordsgenerator.net/)
- A noter que la première tentative de connexion peut se solder par un timeout côté client, car c'est à ce moment là que nextcloud va tout initialiser...
- Si ça arrive, reconnecter vous à nouveau.

- Une fois que vous êtes connecté aux nextcloud en admin:
- Supprimer tout les documents mis par défaut
- Renseigner les informations relatives au compte admin: email, fuseau horaire, ...
- Brancher vous sur LDAP si besoin


### 3- Absolument G
TODO

### 4- NginX et SSL via Let's Encrypt
- `sudo apt install letsencrypt -y`: installation des outils Let's Encrypt
- `sudo /etc/init.d/nginx stop`: on arrête nginx le temps de la manoeuvre
- `sudo letsencrypt certonly --standalone -d cloud.absolumentg.fr`: on génère un certificat pour l'accès direct au cloud' 
- `sudo letsencrypt certonly --standalone -d absolumentg.fr`: on génère un certificat pour l'accès à l'application 
- Une fois accepté les conditions, et fourni un email, le certificat est généré dans le répertoire `/etc/letsencrypt/live/cloud.absolumentg.fr`
- `sudo cp ./nginx_absg5_cloud /etc/nginx/sites-available/absg5_cloud`
- `sudo cp ./nginx_absg5 /etc/nginx/sites-available/absg5`
- `sudo ln -s /etc/nginx/sites-available/absg5_cloud /etc/nginx/sites-enabled/absg5_cloud`
- `sudo ln -s /etc/nginx/sites-available/absg5 /etc/nginx/sites-enabled/absg5`
- `sudo /etc/init.d/nginx start`: on redémarre nginx, et on peut tester via son navigateur que le site est accessible

### 5- Créer le 


### 5- [Optionnel] Supervision avec Graphana
TODO


## Pour aller plus loin
- [Guide de l'utilisateur](docs/user/presentation.md)
- [Maintenance du server](docs/maintenance/server.md)
- [Guide du développeur](docs/developper/welcome.md)
