# InternTrack AI 🤖🎓

InternTrack AI est une plateforme web intelligente de gestion et de suivi des stages académiques, dotée d'un chatbot à intelligence artificielle intégré.

---

## 1. Présentation Générale du Projet

### Contexte et Problématique
Dans la majorité des établissements d'enseignement supérieur, la gestion administrative des stages demeure tributaire de processus manuels, fragmentés et chronophages. Les étudiants sont contraints de transmettre physiquement leurs dossiers et de naviguer dans un système peu lisible, tandis que les enseignants référents croulent sous les demandes ponctuelles sans outils centralisés.
Les principaux dysfonctionnements identifiés sont :
- Absence de centralisation des données.
- Manque de traçabilité des dossiers.
- Dépassements des délais de validation.
- Charge administrative élevée pour les secrétariats.

### La Solution : InternTrack AI
InternTrack AI est une application web fullstack de nouvelle génération qui digitalise l'intégralité du processus de gestion des stages. Elle combine une interface utilisateur moderne et réactive (React), une API REST robuste (Django) et un chatbot conversationnel (InternBot) capable d'assister les utilisateurs 24h/24.

---

## 2. Cahier des Charges & Fonctionnalités

### Acteurs du Système
- **Étudiant** : Soumet son dossier de stage, dépose des documents, suit l'avancement de sa convention et interagit avec le chatbot pour obtenir de l'aide.
- **Enseignant Référent** : Consulte les dossiers de ses étudiants, télécharge les documents, valide ou rejette les demandes avec un commentaire.
- **Administrateur** : Supervise l'ensemble de la plateforme et gère les utilisateurs.

### Besoins Fonctionnels Clés
1. **Module Authentification** : Inscription sécurisée, connexion par JWT.
2. **Module Stage & Documents** : Formulaire de déclaration, upload sécurisé de fichiers, suivi d'état (Brouillon, Soumis, Validé, Rejeté).
3. **Module Chatbot IA** : Assistant virtuel intégré propulsé par l'IA avec connaissance contextuelle du dossier de l'étudiant.
4. **Système de Notifications** : Suivi des événements importants et changements de statuts en temps réel.

---

## 3. Architecture Technique et Choix de Conception

Le projet repose sur une architecture découplée (Séparation Client/Serveur) garantissant sécurité, maintenabilité et évolutivité.

### Frontend (Client)
- **Framework** : React.js via Vite pour un build ultra-rapide.
- **Langage** : TypeScript pour le typage statique strict.
- **Style** : Tailwind CSS pour un design system "Atomic" et une UX premium (Support Dark/Light mode).
- **State Management** : Zustand pour une gestion d'état globale légère.
- **Routage** : React Router DOM.

### Backend (Serveur API)
- **Framework** : Python / Django.
- **API REST** : Django REST Framework (DRF) pour la création d'endpoints scalables.
- **Authentification** : `djangorestframework-simplejwt` pour la gestion des tokens sécurisés.
- **Base de données** : SQLite (par défaut pour le développement) évolutif vers PostgreSQL en production.
- **Intelligence Artificielle** : Intégration de l'API Google Gemini (modèle `gemini-1.5-flash` / `gemini-flash-latest`) avec Streaming SSE (Server-Sent Events).

---

## 4. Installation et Déploiement en Local

### Prérequis
- Node.js (v18+)
- Python (3.10+)
- Git

### Étape 1 : Cloner le dépôt
```bash
git clone https://github.com/JoeCoolCapelo/CHATBOT.git
cd CHATBOT
```

### Étape 2 : Configuration du Backend (Django)
```bash
cd interntrack-django

# Créer et activer l'environnement virtuel
python -m venv venv
# Windows : venv\Scripts\activate
# Mac/Linux : source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations de base de données
python manage.py migrate

# Démarrer le serveur
python manage.py runserver 8001
```
Le backend tourne sur `http://127.0.0.1:8001`.

### Étape 3 : Configuration du Frontend (React)
Dans un nouveau terminal :
```bash
cd interntrack-react

# Installer les paquets
npm install

# Lancer le serveur de développement
npm run dev
```
Le frontend est accessible sur `http://localhost:5173`.

### Configuration de l'IA (InternBot)
Pour activer le chatbot IA :
1. Dans `interntrack-django/api/views.py`, localisez la variable `GEMINI_API_KEY`.
2. Insérez votre clé API Google Gemini.
> **Note :** Si la clé est invalide ou que votre quota est atteint, le système bascule intelligemment sur un **Fallback local** garantissant que l'utilisateur reçoit toujours une réponse instantanée.

---

## 5. Évolutions Futures & Roadmap
- **Court Terme** : Notifications push, signature électronique des conventions intégrée.
- **Moyen Terme** : Analyse automatique des rapports de stage par IA (détection de plagiats, évaluation de qualité).
- **Long Terme** : Transformation en plateforme SaaS multi-tenant pour le déploiement sur plusieurs campus universitaires simultanément.

---

## 6. Conclusion
InternTrack AI représente une vision nouvelle de la relation entre l'université et le monde professionnel, médiatisée par la technologie. En digitalisant, centralisant et "intelligentisant" le suivi des stages, la plateforme libère les acteurs académiques des contraintes bureaucratiques pour leur permettre de se concentrer sur l'essentiel : l'accompagnement pédagogique de qualité.

Les choix technologiques (React, Django, API IA Gérérative) positionnent InternTrack AI sur un socle moderne, démontrant la maîtrise des technologies fullstack et constituant une excellente fondation pour l'avenir de la gestion universitaire (GovTech / EdTech).
