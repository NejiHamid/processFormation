## Installation de FORMAMIAGE

*Ce document montre comment installer l'application depuis le code source.*


### Etape 1 : Installation de NODE

 1. Se rendre sur le site [https://nodejs.org/en/](https://nodejs.org/en/) puis télécharger la version 12.14 LTS.
    
2.  Installer Node en lançant l’assistant d’installation


### Etape 2 : Création d'un projet Google cloud platform (GCP)
*Dans cette partie, nous allons créer un projet gcp et activer les apis google drive, gmail, sheet et docs.*

1.  Se rendre sur [Google Cloud Platform](https://console.cloud.google.com/home/dashboard)
    
2.  Créer un nouveau projet
    
3.  Se rendre sur le tableau des api
**![](https://lh5.googleusercontent.com/gSFnxPuKDtkxQ3AIT9DICWup4tLCP4oVSBixIxUfKb2Gojfql5m21ExxpjsAcTJ8JoSbLHLyq-UNRmx_8tyPF6w-N28--rofw0OakMsrwBiKkcV3Owhyf284xNGkijKf05_ZhP31)**
4. **Cliquer sur activer API**
**![](https://lh5.googleusercontent.com/bTmhji6sLJNGUMGXvtxEQi2AQn0g0kGc38v0aQ3xf5UGQhGPeskNEyBZCIUXg27wS-oDc9M1EQKvMLz6hqjcosXTojtKRKCb9bVS_UflvPVtZ2Z65KSqAbfqyZZKnaKPeyUD4wdd)**

5. Dans rechercher tapez gmail par exemple puis cliquer sur activer 
**![](https://lh3.googleusercontent.com/IkqfDKQL-A6gWIS-ND6IVio8V7zCQSDbICiu15rcoautTAkXnEuz3omgI7OkqNeOuseOAjAm5Ng5NzIs0eZUzvEhHvu5mTWwwyMPtBhof9_KO_eLShR8xhc8dp-J78qan53cOryl)**
**répéter les étapes 4 et 5 pour tous les services google nécessaires pour l’application à savoir :**
- GMAIL
- DRIVE
- Google Docs API
- Google Sheet API

6. Revenir dans le tableau des api et cliquer sur identifiants
**![](https://lh3.googleusercontent.com/Mn2jb_68SQDogstRNR_ZYX1GT06YCTZuhzeq0YJGIidelOLq-XUtYGRgnahEgUoYTMhhjWdDpb4UzQGe_jriA4KeZ40x6f1mh_UHSusGNy5qrZeJZ2aQqBB72Hd1mNKaqL7BH6k5)**
7.  En haut Appuyer sur **![](https://lh5.googleusercontent.com/Oi2fGHupc-1hivDG-TQbrvyhxx6jzylvGMLlQse4XNxSK5Y1FohfR3Qyf-ngEUnZ4gRs3kJI1VWJZ6ARhN5Uzi9S9lhfTzu7iNNZyN9qU5mvuJ8Ilmg107sFjMmLEGgZAVnLLuM8)**
8.  Puis sur pour créer une clé API **![](https://lh4.googleusercontent.com/NgOreQYJq8IdrZCx-ui1WJhZQNwnkigRX8lHkJNvcfsgj8JGeRVV3Bq5ik68wu-aB4_aTZb0uFBzxSv7GuShGXFjuEsRVAxXtTi-jmF8CkamaWy3OCXlfdUO4KgXci1yxbLy1b3x)**
9. Ensuite appuyer de nouveau sur **![](https://lh5.googleusercontent.com/Oi2fGHupc-1hivDG-TQbrvyhxx6jzylvGMLlQse4XNxSK5Y1FohfR3Qyf-ngEUnZ4gRs3kJI1VWJZ6ARhN5Uzi9S9lhfTzu7iNNZyN9qU5mvuJ8Ilmg107sFjMmLEGgZAVnLLuM8)**
10. Puis sur **![](https://lh3.googleusercontent.com/G-_LQuzG5FicW32qPuMcUAeR4f76zxHjdEXvm8hz0Rrkm2pAaEiTCqez9wBHZe6SRTV_ao6F9VZsIyE4CpWTuGS63hc6F4CHnLdj4gYl0VSJbGtrMNlSBI4lF0kXFT_IY3Iuxr-p)**
11. Cocher la cache application web et renseigner origin javascript autorisée comme suit :
 **![](https://lh6.googleusercontent.com/bp7cKlVNVVSTP2-jytY26ViE8bRGHN83Kcdeiemo2vX7lg1IGeUGxy5wMGhCEo9I3H90v5J2UTEUcqlgmQTAv-lGvWPIwZibde5oLaOpwG1fPSiE1di20YAxNaR8L7lqb27gJz2E)**
13.  Copier l’API KEY et l’ID CLIENT pour l'étape suivante
 **![](https://lh5.googleusercontent.com/uDrBG-j2UiUOYl_vIMn2k61s4_ML-JNnZgez1rHK4aVWb6NEQaZz0x9LCnrtAYgXnahWQTaN-a3TzATU0diqFppLQR9wUGFmjWwq5kTtHX0zDEmSyhTbd-411azQKiq9K8m23YO9)**

### Etape 3: Installation du code source
*Dans cette étape, nous allons installer les éléments nécessaires pour lancer le projet en local  à partir du code source fourni* 

 1. Décompresser l’archive fournie
 2. Se placer dans le répertoire décompressé
 3. Ouvrir un terminal
 4. Tapez la commande `npm install` pour installer les dépendances
 5. Puis tapez la commande `npm run config -- --clientId=VOTRECLIENTID --apiKey=VOTREAPIKEY`


### Etape 4: Lancement du projet en local
*Dans cette étape, nous allons lancer le projet en local*

1. Se placer dans le répertoire décompressé
2. Ouvrir un terminal
3. Tapez la commande `npm run serve`
4. Se rendre sur http://localhost:8000/#/
