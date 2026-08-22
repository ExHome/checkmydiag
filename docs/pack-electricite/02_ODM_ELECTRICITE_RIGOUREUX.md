# ODM Verriere — mini-app electricite (pack du 22/08/2026)

*Transcrit du .docx du pack VERRIERE_ELECTRICITE_PACK_CLAUDE.zip. Le visuel de
reference (01_VISUEL_REFERENCE_ELECTRICITE.png) reste en Dropbox : c'est une
MAQUETTE, ses chiffres, codes et niveaux sont fictifs et ne doivent jamais
servir de valeurs par defaut.*

VERRIÈRE — MINI-APP ÉLECTRICITÉ
ORDRE DE MISSION MAÎTRE — CLAUDE
Référence visuelle + logique métier + états + traçabilité + garde-fous

1. Objectif de la mini-app
Transformer un diagnostic électrique complexe en une synthèse compréhensible immédiatement, sans appauvrir ni déformer le rapport.
Le diagnostic électricité évalue les risques pouvant porter atteinte à la sécurité des personnes ainsi que le fonctionnement de l'installation ; l'interface doit donc rester centrée sur les constats de sécurité et leur compréhension.
Le visuel joint fixe l'ambition graphique, pas le contenu métier. Les nombres, catégories, codes et libellés affichés dans le mockup sont illustratifs.
2. Architecture obligatoire
POINTS CLÉS : 3 à 5 conclusions majeures réellement extraites du rapport, avec libellé court, explication en langage simple et accès au détail.
RÉSULTAT GLOBAL : synthèse factuelle de l'état de l'installation. Ne jamais inventer un niveau de risque ou une conformité globale si le rapport ne le formule pas ainsi.
RÉSULTAT DÉTAILLÉ : présenter les anomalies par familles utiles à la compréhension, tout en conservant les codes et libellés techniques d'origine dans le détail.
CE QUI A ÉTÉ CONTRÔLÉ : appareil général de commande/protection, dispositif différentiel, prise de terre et équipotentialité, installation dans les locaux contenant une baignoire/douche, matériels et conducteurs, équipements fixes et autres éléments réellement vérifiés selon le rapport.
CONSTATATIONS DIVERSES : toutes observations libres, vétusté, matériels particuliers, anomalies de fixation, protections mécaniques, obturateurs, conducteurs, repérage, conditions de visite, etc., uniquement si présents.
CE QUI N'A PAS ÉTÉ CONTRÔLÉ : parties inaccessibles, coffrets scellés, zones masquées, dépendances non visitées, matériels non démontables, éléments hors périmètre ou non vérifiables, avec le motif si disponible.
CONSEIL VERRIÈRE : expliquer les suites pratiques après les faits, en distinguant urgence, recommandation, mise en sécurité et simple amélioration.
3. Règle absolue sur les anomalies
Ne jamais reclasser arbitrairement une anomalie en « critique », « importante », « modérée » ou « à améliorer » sans règle métier validée.
Conserver le code d'anomalie, le libellé source, la localisation et la mesure/observation correspondante quand ils existent.
Créer deux niveaux de lecture : une formulation pédagogique grand public et, dessous ou au clic, la formulation technique exacte du rapport.
Si plusieurs anomalies concernent le même thème, les regrouper visuellement sans supprimer les occurrences ni les localisations.
Une absence d'anomalie sur un point contrôlé doit être distinguée d'un point non vérifié ou non applicable.
4. Gravité et priorisation
La couleur ne doit jamais être le seul indicateur de gravité.
Toute priorisation doit venir soit du rapport, soit d'une matrice métier validée et documentée par Verrière.
En l'absence de règle validée, afficher les anomalies sans inventer de score ni de niveau de danger.
Ne jamais transformer un diagnostic en attestation de conformité à une norme d'installation neuve ; la restitution doit rester fidèle à l'objet réglementaire de l'état de l'installation intérieure.
Ne jamais écrire « installation conforme à la NF C 15-100 » ou « non conforme à la NF C 15-100 » si cette conclusion n'existe pas dans la source et n'est pas juridiquement fondée par le diagnostic.
5. Éléments à rendre particulièrement lisibles
Protection différentielle 30 mA et protection contre les surintensités.
Prise de terre et continuité des conducteurs de protection.
Liaisons équipotentielles.
Parties actives nues accessibles ou matériels présentant un risque de contact direct.
Matériels vétustes, inadaptés ou présentant des risques d'utilisation.
Règles particulières des locaux contenant une baignoire ou une douche.
Conducteurs, connexions, tableaux, coffrets et appareillages.
Anomalies liées aux prises, points lumineux et équipements fixes lorsque le rapport les mentionne.
Constatations diverses et limites de contrôle.
6. Ce qui n'a pas été contrôlé
Bloc obligatoire dès qu'une limite figure dans le rapport.
Ne jamais assimiler « non contrôlé », « non vérifié », « non applicable » et « conforme ».
Afficher la cause exacte lorsqu'elle est connue : inaccessible, scellé, masqué, démontage interdit, coupure impossible, dépendance non visitée, etc.
Les éléments non contrôlés ne doivent jamais entrer dans un score rassurant comme s'ils avaient été vérifiés.
7. Niveau de confiance / complétude
Le « 80 % » du mockup est un exemple visuel et ne doit pas être codé comme valeur par défaut.
Si Verrière conserve un indicateur de complétude, il doit reposer sur une règle de calcul documentée distinguant contrôlé, non contrôlé, non applicable et non vérifiable.
À défaut de méthode validée, remplacer le pourcentage par une phrase factuelle sur les limites du contrôle.
8. États métier obligatoires
Aucune anomalie relevée sur les points effectivement contrôlés.
Une anomalie unique.
Plusieurs anomalies de familles différentes.
Anomalie présentant un danger nécessitant une compréhension immédiate.
Anomalies nombreuses mais sans hiérarchie métier validée.
Éléments non contrôlés / non vérifiés.
Éléments non applicables.
Constatations diverses présentes.
Rapport incomplet ou pages manquantes.
Extraction incertaine, code inconnu ou contradiction entre synthèse et tableau.
Photos présentes ou absentes.
Localisation précise présente ou absente.
9. Traçabilité obligatoire
Chaque anomalie affichée doit pouvoir renvoyer à son code et à son libellé source.
Chaque explication pédagogique doit pouvoir être comparée au texte technique original.
Chaque localisation doit être conservée.
Chaque photo liée à une anomalie doit être accessible si le rapport en contient.
Chaque zone non contrôlée doit être reliée à sa justification source.
Aucune donnée ne doit être supprimée parce qu'elle semble trop technique.
10. Design Verrière
Conserver l'ivoire chaud, le vert profond et un jaune électrique maîtrisé pour les alertes ; réserver le rouge aux situations réellement justifiées.
Le rendu doit évoquer un bureau d'architecture premium : précision, respiration, profondeur légère, aucune esthétique de logiciel administratif.
Les blocs complexes doivent se déplier progressivement afin de ne pas submerger l'utilisateur.
Les pictogrammes servent de repères visuels mais ne remplacent jamais le texte.
Sur mobile, aucune information critique ne doit être tronquée, masquée ou dépendre du survol.
11. Ordre d'exécution pour Claude
1. Reproduire l'architecture visuelle du mockup sans reprendre ses données fictives.
2. Construire le mapping rapport source -&gt; données structurées -&gt; cartes UI.
3. Définir précisément les états : anomalie, absence d'anomalie, non contrôlé, non applicable, non vérifiable, donnée absente et donnée incertaine.
4. Conserver les codes et libellés techniques dans le niveau de détail.
5. Produire une reformulation pédagogique séparée, jamais substitutive.
6. Ajouter les constatations diverses et toutes les limites de contrôle.
7. Ne pas inventer de score de danger, de conformité ou de confiance.
8. Tester au minimum : rapport simple, rapport avec nombreuses anomalies, rapport avec zones non contrôlées, rapport avec informations ambiguës.
9. Vérifier la cohérence entre compte des anomalies, liste détaillée, catégories, localisations et source.
10. Effectuer une revue de non-régression visuelle et métier avant toute validation.
12. Critères de validation - livraison interdite si un point échoue
☐ Aucun code, article, nombre ou niveau de risque inventé.
☐ Toutes les anomalies du rapport sont présentes.
☐ Les localisations sont conservées.
☐ Les constatations diverses sont restituées.
☐ Tous les éléments non contrôlés sont visibles.
☐ Non contrôlé / non applicable / conforme ne sont jamais confondus.
☐ Les formulations pédagogiques restent fidèles au sens technique.
☐ Les données importantes sont traçables vers la source.
☐ Le cas avec nombreuses anomalies reste lisible.
☐ Le cas sans anomalie reste exact sans créer de garantie excessive.
☐ Le mobile est lisible sans troncature.
☐ La charte Verrière est respectée.
13. Références réglementaires de cadrage à conserver dans la documentation projet
Arrêté du 28 septembre 2017 définissant le modèle et la méthode de réalisation de l'état de l'installation intérieure d'électricité dans les immeubles à usage d'habitation.
Le texte précise que l'état vise à évaluer les risques pouvant porter atteinte à la sécurité des personnes et le fonctionnement de l'installation.
Le contrôle porte sur l'installation privative en aval de l'appareil général de commande et de protection, jusqu'aux bornes d'alimentation ou socles de prises, et sur l'adéquation des équipements fixes et leurs conditions d'installation au regard des exigences de sécurité.
Claude doit considérer les textes officiels et les référentiels métier fournis à Verrière comme supérieurs aux exemples graphiques.