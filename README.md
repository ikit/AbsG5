<img src="https://raw.githubusercontent.com/REGOVAR/Regovar/master/logo/logotitle.color.png" height="150px"/>

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
- `cd /var/absg5/git/Absg5/install`
- personnaliser le fichier `absg_nextcloud.yml` selon vos préférences (changer en particulier les [mots de passes](https://passwordsgenerator.net/))
  - `MYSQL_ROOT_PASSWORD`
  - `MYSQL_PASSWORD`
- `docker-compose -f absg_nextcloud.yml up -d`: pour créer et démarrer les containers
- `docker-compose -f absg_nextcloud.yml down`: pour tuer et arrêter les containers sans perdre les données. 
- `docker-compose -f absg_nextcloud.yml down --volumes`: pour supprimer tout (y compris les données stocké sur le serveur)

### 3- Absolument G
TODO

### 4- NginX et SSL via Let's Encrypt
TODO

### 5- [Optionnel] Supervision avec Graphana
TODO


## Pour aller plus loin
- [Guide de l'utilisateur](docs/user/presentation.md)
- [Maintenance du server](docs/maintenance/server.md)
- [Guide du développeur](docs/developper/welcome.md)