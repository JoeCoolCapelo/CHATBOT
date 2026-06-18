# InternTrack AI 🤖🎓

InternTrack AI est une plateforme moderne de gestion de stages universitaires, conçue pour faciliter le suivi entre les étudiants, les enseignants référents et l'administration. Elle intègre un assistant intelligent (**InternBot**) capable de guider les étudiants et les enseignants en temps réel.

## 🌟 Fonctionnalités Principales

- **Gestion des dossiers de stage** : Soumission, validation et suivi de l'état d'avancement des conventions de stage.
- **Dépôt de documents** : Les étudiants peuvent uploader leurs documents (conventions, attestations) avec des titres personnalisés.
- **Tableaux de bord dédiés** : Interfaces distinctes pour les Étudiants, les Enseignants et les Administrateurs.
- **InternBot (Chatbot IA)** : Assistant virtuel intégré propulsé par l'IA (Google Gemini) avec mode de secours local, capable de répondre aux questions contextuelles selon le profil de l'utilisateur.
- **Notifications en temps réel** : Suivi des événements importants et changements de statut.

## 🛠️ Technologies Utilisées

Ce projet est séparé en deux environnements distincts :

### Frontend (`/interntrack-react`)
- **React.js** (via Vite)
- **TypeScript**
- **Tailwind CSS** (pour un design moderne et responsif)
- **Zustand** (gestion d'état)
- **React Router** (navigation)

### Backend (`/interntrack-django`)
- **Python / Django**
- **Django REST Framework (DRF)**
- **SQLite** (base de données par défaut)
- **JWT (JSON Web Tokens)** pour l'authentification
- **Google Generative AI** (pour le moteur du chatbot)

---

## 🚀 Installation et Lancement en Local

### 1. Cloner le dépôt
```bash
git clone https://github.com/JoeCoolCapelo/CHATBOT.git
cd CHATBOT
```

### 2. Configuration du Backend (Django)

Ouvrez un terminal et naviguez dans le dossier du backend :
```bash
cd interntrack-django
```

Créez un environnement virtuel et installez les dépendances :
```bash
python -m venv venv
# Activation sous Windows :
venv\Scripts\activate
# (Activation sous Mac/Linux : source venv/bin/activate)

pip install -r requirements.txt
```

Appliquez les migrations de la base de données :
```bash
python manage.py migrate
```

Lancer le serveur de développement :
```bash
python manage.py runserver 8001
```
Le backend sera accessible sur `http://127.0.0.1:8001`.

### 3. Configuration du Frontend (React)

Ouvrez un **nouveau terminal** et naviguez dans le dossier du frontend :
```bash
cd interntrack-react
```

Installez les paquets NPM :
```bash
npm install
```

Lancer le serveur de développement Vite :
```bash
npm run dev
```
Le frontend sera accessible (généralement) sur `http://localhost:5173`.

---

## 🔑 Configuration du Chatbot IA (Optionnel)

Si vous possédez une clé API Google Gemini valide :
1. Ouvrez le fichier `interntrack-django/api/views.py`.
2. Cherchez la variable `GEMINI_API_KEY`.
3. Insérez votre clé API entre les guillemets : `GEMINI_API_KEY = "votre_clé_ici"`.

> **Note :** Si la clé est vide ou que le quota est dépassé, le système basculera automatiquement sur un mode "Fallback local" très rapide, capable de répondre aux questions basiques sur l'état du stage de l'utilisateur.

---

## 🤝 Contribution
Toute contribution au projet est la bienvenue. N'hésitez pas à ouvrir des *Issues* ou soumettre des *Pull Requests*.

## 📄 Licence
Ce projet est développé dans le cadre d'un suivi académique.
