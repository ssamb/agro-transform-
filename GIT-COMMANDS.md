# 📦 Guide Git - AgroTransform

## 🚀 Commandes Git avec opencode

### Utiliser le skill git-commit

```powershell
# Avec opencode en mode interactif
opencode --skill git-commit "créer une nouvelle branche feature"

# Commandes directes
git status
git add .
git commit -m "type: message"
git push origin main
```

## 📝 Types de commits (Conventional Commits)

| Type | Description | Exemple |
|------|-----------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: ajout page produits` |
| `fix` | Correction de bug | `fix: correction erreur login` |
| `docs` | Documentation | `docs: mise à jour README` |
| `style` | Formatage (sans impact code) | `style: formatage code` |
| `refactor` | Refactoring | `refactor: optimisation API` |
| `test` | Tests | `test: ajout tests unitaires` |
| `chore` | Maintenance | `chore: mise à jour dépendances` |

## 🎯 Workflows Git

### Workflow 1 : Nouvelle fonctionnalité
```powershell
# 1. Créer une branche
git checkout -b feature/nom-fonctionnalite

# 2. Travailler et commiter
git add .
git commit -m "feat: description fonctionnalité"

# 3. Push
git push origin feature/nom-fonctionnalite
```

### Workflow 2 : Correction de bug
```powershell
# 1. Branche de fix
git checkout -b fix/nom-bug

# 2. Correction
git add .
git commit -m "fix: correction bug description"

# 3. Push
git push origin fix/nom-bug
```

### Workflow 3 : Daily update
```powershell
# 1. Récupérer modifications
git pull origin main

# 2. Travailler
git add .
git commit -m "chore: mise à jour quotidienne"

# 3. Push
git push origin main
```

## 🔧 Commandes utiles

### Voir l'historique
```powershell
# Historique simple
git log --oneline

# Historique détaillé
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# 10 derniers commits
git log --oneline -10
```

### Gérer les branches
```powershell
# Lister branches
git branch -a

# Changer de branche
git checkout nom-branche

# Supprimer branche
git branch -d nom-branche
```

### Annuler des modifications
```powershell
# Annuler modifications non commit
git checkout -- fichier

# Décommiter dernier commit
git reset --soft HEAD~1

# Annuler commit pushé (attention!)
git revert HEAD
```

## 📊 Statut Git

```powershell
# Voir l'état
git status

# Voir les différences
git diff

# Voir les tags
git tag -l
```

## 🌐 Remote (GitHub, GitLab, etc.)

```powershell
# Ajouter remote
git remote add origin https://github.com/user/repo.git

# Push vers remote
git push -u origin main

# Récupérer modifications
git pull origin main

# Voir les remote
git remote -v
```

## 💡 Astuces opencode + Git

### Utiliser le skill git-commit
```powershell
# Demander à opencode de créer un commit
opencode --skill git-commit "prépare le commit pour la feature login"

# Opencode va :
# 1. Vérifier git status
# 2. Ajouter les fichiers modifiés
# 3. Créer un message de commit approprié
# 4. Effectuer le commit
```

### Exemples de demandes
- "Crée un commit pour les modifications API"
- "Prépare le push de la branche feature"
- "Affiche les derniers commits"
- "Crée une branche pour la feature dashboard"

## 🎯 Bonnes pratiques

1. ✅ Commits atomiques (une fonctionnalité = un commit)
2. ✅ Messages clairs et descriptifs
3. ✅ Utiliser les types conventionnels
4. ✅ Tester avant de commiter
5. ✅ Push régulier
6. ✅ Jamais de credentials dans le code
7. ✅ .gitignore à jour

## 📚 Références

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
