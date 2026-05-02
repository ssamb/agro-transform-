@echo off
setlocal

REM Récupérer le premier argument (le type de skill)
set SKILL_TYPE=%1
shift

REM Vérifier si un argument a été fourni
if "%SKILL_TYPE%" == "" (
    echo ==============================================
    echo   AgroTransform - Skills Helper
    echo ==============================================
    echo.
    echo Usage: skills.bat [skill] "votre demande"
    echo.
    echo Skills disponibles :
    echo   pm       - Project Manager (gestion de projet, PLAN_TACHES.md)
    echo   git      - Git Expert (commits, branches, push)
    echo   dev      - Développeur Fullstack (React, Node.js, code)
    echo   debug    - Debugger (correction d'erreurs, analyse)
    echo   senegal  - Expert Sénégal (prix FCFA, conseils locaux)
    echo.
    echo Exemples :
    echo   skills.bat pm "Mets à jour PLAN_TACHES.md avec la tâche 15"
    echo   skills.bat git "Fais un commit propre des modifications"
    echo   skills.bat dev "Crée un composant Button avec TailwindCSS"
    echo   skills.bat debug "Analyse cette erreur TypeScript"
    echo   skills.bat senegal "Quel est le prix du mil à Dakar ?"
    echo.
    goto :eof
)

REM Récupérer le reste de la ligne comme message
set MESSAGE=%*

REM Vérifier si un message a été fourni
if "%MESSAGE%" == "" (
    echo Erreur: Veuillez fournir un message entre guillemets.
    echo Exemple: skills.bat %SKILL_TYPE% "votre demande"
    goto :eof
)

REM Construire le prompt en fonction du skill
set PROMPT=

if "%SKILL_TYPE%" == "pm" (
    set PROMPT=Agis en tant que Project Manager expert pour AgroTransform. Ta mission : %MESSAGE%. Utilise le fichier .opencode/skills/project-manager.json comme référence. Mets à jour les fichiers .md (PLAN_TACHES.md, README.md) si nécessaire. Sois précis et structuré.
) else if "%SKILL_TYPE%" == "git" (
    set PROMPT=Agis en tant qu'expert Git pour AgroTransform. Ta mission : %MESSAGE%. Utilise les conventions de commit (feat/fix/docs/style/refactor/test/chore). Vérifie git status, propose un message de commit clair, et exécute git add + git commit. Utilise le fichier .opencode/skills/git-commit.json comme référence.
) else if "%SKILL_TYPE%" == "dev" (
    set PROMPT=Agis en tant que Développeur Fullstack expert (React, TypeScript, Node.js, PostgreSQL, Prisma) pour AgroTransform. Ta mission : %MESSAGE%. Utilise le fichier .opencode/skills/fullstack-dev.json comme référence. Respecte les bonnes pratiques : TypeScript strict, composants fonctionnels, code propre, pas de secrets. Crée ou modifie les fichiers .ts/.tsx selon le besoin.
) else if "%SKILL_TYPE%" == "debug" (
    set PROMPT=Agis en tant qu'expert Debugger pour AgroTransform. Ta mission : %MESSAGE%. Utilise le fichier .opencode/skills/debugger.json comme référence. Analyse l'erreur, identifie la cause racine, propose une correction, et teste la solution. Ne casse pas les fonctionnalités existantes.
) else if "%SKILL_TYPE%" == "senegal" (
    set PROMPT=Agis en tant qu'expert du marché sénégalais pour AgroTransform. Ta mission : %MESSAGE%. Utilise les prix en FCFA, les réalités locales (régions, saisons, marchés). Utilise les fichiers .opencode/skills/fullstack-dev.json et frontend/src/utils/senegalPrices.ts comme référence. Donne des conseils pratiques et réalistes.
) else (
    echo Erreur: Skill '%SKILL_TYPE%' non reconnu.
    echo Skills disponibles : pm, git, dev, debug, senegal
    goto :eof
)

echo ==============================================
echo   Skill: %SKILL_TYPE%
echo   Message: %MESSAGE%
echo ==============================================
echo.
echo Exécution en cours...
echo.

REM Lancer opencode avec le prompt construit
opencode run "%PROMPT%"

endlocal
