/**
 * Dossier de démonstration.
 *
 * Ce sont de fausses pages, écrites dans la mise en forme réelle des rapports,
 * et passées par le moteur d'analyse comme n'importe quel PDF déposé : ce que le
 * visiteur voit en exemple est produit par le même code que son propre rapport.
 * Aucune donnée réelle ici — l'adresse et les chiffres sont inventés.
 */
import type { PageTexte } from './lignes';

/**
 * Le dossier de démonstration n'a pas de vraies coordonnées, puisqu'il n'y a pas
 * de PDF derrière. On en fabrique de plausibles — une ligne sous l'autre, sur une
 * page A4 — pour que la démonstration montre aussi le rapport annoté.
 */
function avecPositions(pages: PageTexte[]): PageTexte[] {
  const HAUT = 780;
  const INTERLIGNE = 26;

  return pages.map((page) => ({
    ...page,
    positions: page.lignes.map((texte, i) => ({
      texte,
      x: 62,
      y: HAUT - i * INTERLIGNE,
      largeur: Math.min(470, texte.length * 5.2),
      hauteur: 12
    }))
  }));
}

export function pagesExemple(): PageTexte[] {
  return avecPositions([
    {
      numero: 1,
      lignes: [
        'Dossier Technique Immobilier',
        'Numéro de dossier : 26/EXE/0001',
        'Date du repérage : 12/03/2026',
        'Adresse : ........... 12 rue de l’Exemple',
        'Commune : ....... 33000 BORDEAUX (France)',
        'Objet de la mission :',
        'Dossier Technique Amiante Métrage (Loi Carrez) Etat des Installations électriques',
        'Exposition au plomb (CREP) Diagnostic énergétique Etat des Installations gaz',
        'Etat relatif à la présence de termites Etat des Risques et Pollutions Audit énergétique'
      ]
    },
    {
      numero: 2,
      lignes: [
        'N°ADEME : 2633E2660001X',
        'Diagnostic de performance',
        /*
         * Un DPE de 2025, pas de 2026.
         *
         * L'exemple doit ressembler à ce qu'on reçoit. Mesuré sur le corpus :
         * les trente-et-un DPE réels sont tous antérieurs au 1ᵉʳ janvier 2026,
         * donc tous concernés par le changement du facteur de conversion de
         * l'électricité — et par le droit à une mise à jour gratuite. Daté de
         * 2026, l'exemple était en avance sur le parc et ne montrait rien de
         * cette réforme.
         */
        'Etabli le : 12/03/2025',
        'énergétique (logement) Valable jusqu’au : 11/03/2035',
        'Adresse : 12 rue de l’Exemple',
        '33000 BORDEAUX (France)',
        'Type de bien : Appartement',
        'Année de construction : Avant 1948',
        'Surface de référence : 48.5 m²',
        'Ce logement émet 1 260 kg de CO ₂ par an,',
        'entre 1 890 € et 2 560 € par an'
      ]
    },
    {
      numero: 3,
      lignes: [
        'DPE Diagnostic de performance énergétique (logement) p. 3',
        'Montants et consommations annuels d’énergie',
        'chauffage Gaz naturel 13 400 (12 100 é.f.) entre 1 340 € et 1 810 €',
        'eau chaude Gaz naturel 4 100 (3 700 é.f.) entre 410 € et 560 €',
        'éclairage Electrique 260 (113 é.f.) entre 20 € et 40 €',
        'auxiliaires Electrique 340 (148 é.f.) entre 30 € et 60 €',
        'énergie totale pour les 18 100 kWh entre 1 890 € et 2 560 €'
      ]
    },
    {
      numero: 4,
      lignes: [
        'Etat de l’installation intérieure d’électricité n° 26/EXE/0001',
        'L’installation intérieure d’électricité comporte 4 anomalies.',
        'Date de la visite : 12/03/2026',
        'Appareil général de commande et de protection : accessible',
        'Dispositif de protection différentielle à l’origine de l’installation : absent',
        'Installation de mise à la terre : prise de terre non conforme',
        'Matériels électriques vétustes ou inadaptés à l’usage constatés dans le séjour',
        'Conducteurs non protégés mécaniquement dans le couloir',
        // La liste que les vrais rapports impriment, et que le moteur restitue
        // point par point. Reproduite ici avec ses coupures de fin de colonne :
        // le dossier de démonstration doit exercer le même chemin qu'un vrai.
        'Anomalies avérées selon les domaines suivants :',
        'Dispositif de protection différentiel à l’origine de l’installation / Prise de terre et installation de mise à la',
        'terre.',
        'Dispositif de protection contre les surintensités adapté à la section des conducteurs, sur chaque circuit.',
        'Matériels électriques présentant des risques de contacts directs avec des éléments sous tension -',
        'Protection mécanique des conducteurs.',
        'Domaines Anomalies Photo',
        'Libellé de l’anomalie : B7.3 a L’enveloppe d’au moins un matériel est',
        'détériorée.',
        'Parties du bien (pièces et emplacements) n’ayant pu être visitées et justification :',
        '2ème étage - Combles (Absence de trappe de visite)'
      ]
    },
    {
      numero: 5,
      lignes: [
        "Constat de risque d'exposition au plomb n° 26/EXE/0001",
        'Ce Constat de Risque d’Exposition au Plomb a été rédigé par EXEMPLE le 12/03/2026',
        'Conclusion des mesures de concentration en plomb',
        'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3',
        'Nombre d’unités',
        '54 12 33 5 2 2',
        '% 100 22,2 % 61,1 % 9,3 % 3,7 % 3,7 %',
        "Dans le cadre de la mission, il a été repéré des unités de diagnostics de classe 3.",
        'N° Zone Unité de diagnostic Substrat Revêtement apparent Etat de conservation Classement UD',
        'Salle de bain',
        'A Porte (P1) Bois Peinture 3',
        'B Plinthes Bois Peinture 2',
        'Chambre 1',
        'A Fenêtre (F1) Bois Peinture 3',
        'B Mur Plâtre Peinture 0',
        'Cuisine',
        'A Plinthes Bois Peinture 2',
        'B Plafond Plâtre Peinture 0'
      ]
    },
    {
      numero: 6,
      lignes: [
        'Etat relatif à la présence de termites n° 26/EXE/0001',
        // Volontairement plus ancien que le reste du dossier : le contrôle de
        // validité doit le signaler, c'est le cas le plus fréquent en vrai.
        'Date du repérage : 02/09/2025',
        'Le bien est situé dans une zone soumise à un arrêté préfectoral:',
        "Niveau d'infestation moyen",
        'Piece 1 Sol - Carrelage Absence d’indices d’infestation de termites',
        'Piece 1 Plinthes - A, B - Bois Absence d’indices d’infestation de termites',
        'Piece 2 Sol - Parquet Absence d’indices d’infestation de termites',
        'Piece 3 Charpente - Bois Absence d’indices d’infestation de termites',
        "Il n'a pas été repéré d'indice d'infestation de termites."
      ]
    },
    {
      numero: 7,
      lignes: [
        'Etat des Risques et Pollutions n° 26/EXE/0001',
        'Selon les informations mises à disposition dans le Dossier Communal d’Information :',
        '- Le risque sismique (niveau 2, sismicité Faible) et par la réglementation de',
        'construction parasismique EUROCODE 8.',
        "Le bien se situe dans une zone d'exposition forte du phénomène de retrait -",
        'gonflement des sols argileux.',
        "Le bien ne se situe pas dans une zone d'un Plan d'Exposition au Bruit.",
        'Aucun secteur d’information sur les sols ne concerne la parcelle.'
      ]
    },
    {
      numero: 8,
      lignes: [
        'Repérage des matériaux et produits contenant de l’amiante n° 26/EXE/0001',
        'Date du repérage : 12/03/2026',
        "Il n'a pas été repéré de matériaux et produits contenant de l'amiante dans les parties visitées."
      ]
    },
    {
      numero: 9,
      lignes: [
        'Certificat de superficie n° 26/EXE/0001',
        'Certificat de superficie de la partie privative',
        // 42 m² face aux 48,5 m² du DPE : l'écart dépasse la tolérance et doit
        // déclencher une question.
        'Superficie Loi Carrez totale : 42,00 m²',
        'Surface au sol totale : 44,80 m²'
      ]
    }
  ]);
}
