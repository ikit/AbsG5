# Maintenance
## 1- Automatisation de l'archivage des données
TODO

## 2- Mise à jour de NextCloud
TODO

## 3- Mise à jour d'Absolument G Core v5
### Synchronisation ponctuelle du schéma de la base
En production, TypeORM ne synchronise pas le schéma automatiquement. Après une mise à jour majeure qui modifie les entités :

1. Sauvegarder la base.
2. Ajouter `DB_SYNCHRONIZE=true` aux variables d'environnement du service `absg5_core`.
3. Redémarrer le service une seule fois et vérifier dans les logs que le schéma a bien été synchronisé (un avertissement le signale).
4. **Retirer `DB_SYNCHRONIZE`** et redémarrer : si on la laisse, TypeORM modifie le schéma à chaque démarrage et peut supprimer des colonnes.

## 4- Renouvellement des certificats
TODO