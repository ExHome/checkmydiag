/**
 * Les mots qu'on ne peut pas employer sans les expliquer.
 *
 * Le retour au client emploie forcément des termes de la profession — passoire,
 * audit, DGI, opposable. Les éviter appauvrirait le propos ; les laisser sans
 * explication trahirait le devoir de conseil. On les définit donc une fois, ici,
 * et cette table sert aux deux usages : le mot souligné dans la phrase, et le
 * lexique en annexe du document remis.
 */
export interface Mot {
  /** Le mot tel qu'il apparaît en annexe. */
  nom: string;
  motif: RegExp;
  definition: string;
}

export const LEXIQUE: Mot[] = [
  {
    nom: 'Passoire énergétique',
    motif: /passoires? [ée]nerg[ée]tiques?/i,
    definition:
      'Un logement classé F ou G. Le mot est officiel : il déclenche le gel du loyer, puis l’interdiction de louer.'
  },
  {
    nom: 'Audit énergétique',
    motif: /audits? [ée]nerg[ée]tiques?/i,
    definition:
      'Une étude plus poussée que le DPE, avec des scénarios de travaux chiffrés. Elle doit être remise à l’acheteur, en plus du DPE, pour vendre une maison mal classée.'
  },
  {
    nom: 'DGI',
    motif: /\bDGI\b/,
    definition:
      'Danger grave et immédiat. Le diagnostiqueur coupe le gaz sur place le jour même et prévient le distributeur : seule une intervention professionnelle permet de le remettre en service.'
  },
  {
    nom: 'Gel du loyer',
    motif: /gel[ée]?s? (?:du |des )?loyers?|loyer est gel[ée]/i,
    definition:
      'Le loyer ne peut plus être augmenté : ni révision annuelle, ni réévaluation entre deux locataires.'
  },
  {
    nom: 'Opposable',
    motif: /\bopposables?\b/i,
    definition:
      'Le document engage juridiquement. Un acheteur qui constate une erreur peut se retourner contre le diagnostiqueur.'
  },
  {
    nom: 'Devis',
    motif: /devis/i,
    definition:
      'Un chiffrage écrit par un artisan. C’est la pièce qui transforme une anomalie du rapport en montant discutable devant le vendeur.'
  },
  {
    nom: 'Déperdition',
    motif: /d[ée]perditions?/i,
    definition: 'La chaleur qui s’échappe du logement, paroi par paroi.'
  },
  {
    nom: 'Sans démontage',
    motif: /sans d[ée]montage/i,
    definition:
      'Le diagnostiqueur regarde, il ne casse rien. Pas de trou, pas de cloison déposée : ce qui est caché reste inconnu. C’est la limite commune à tous ces diagnostics.'
  },
  {
    nom: 'Vide sanitaire',
    motif: /vide sanitaire/i,
    definition:
      'L’espace d’air laissé entre le sol et le plancher du rez-de-chaussée. Il protège de l’humidité, mais refroidit le plancher.'
  },
  {
    nom: 'Combles',
    motif: /combles?/i,
    definition:
      'Le volume situé sous la toiture. Isoler leur plancher est le chantier le moins cher et le plus rentable de tous.'
  },
  {
    nom: 'Anomalie',
    motif: /anomalies?/i,
    definition:
      'Un point de l’installation qui ne respecte pas la norme de sécurité contrôlée. Ce n’est pas une panne : l’installation fonctionne, mais elle expose à un risque.'
  },

  /* Les sigles et les mots que le rapport emploie sans jamais les traduire.
     Chacun d'eux évitait jusqu'ici une phrase d'explication à l'écran : c'est
     tout l'intérêt de les ranger ici. */
  {
    nom: 'A1',
    motif: /\bA1\b/,
    definition:
      'Le défaut gaz le moins grave. À faire réparer un jour, sans urgence : rien ne vous oblige à agir tout de suite.'
  },
  {
    nom: 'A2',
    motif: /\bA2\b/,
    definition:
      'Un défaut gaz à faire réparer vite. L’installation reste en service, mais le risque est réel : prenez rendez-vous avec un professionnel.'
  },
  {
    nom: 'ADEME',
    motif: /\bADEME\b/,
    definition:
      'L’agence publique de la transition écologique. Tous les DPE lui sont envoyés : chacun reçoit un numéro, et c’est ce numéro qui prouve qu’il existe officiellement.'
  },
  {
    nom: 'CO₂',
    motif: /CO₂|gaz [àa] effet de serre/i,
    definition:
      'Le gaz rejeté quand on se chauffe. Le DPE en donne une deuxième note, à côté de celle de la consommation : c’est la moins bonne des deux qui devient l’étiquette du logement.'
  },
  {
    nom: 'Radon',
    motif: /\bradons?\b/i,
    definition:
      'Un gaz naturel qui sort du sol, invisible et sans odeur, présent surtout en zone granitique. Il s’accumule dans les pièces mal ventilées ; aérer suffit le plus souvent.'
  },
  {
    nom: 'Superficie privative',
    motif: /superficies? privatives?/i,
    definition:
      'La surface au sol des pièces, comptée seulement là où le plafond dépasse 1,80 m. C’est le chiffre qui sera écrit dans l’acte de vente.'
  },
  {
    nom: 'Énergie finale',
    motif: /[ée]nergie finale/i,
    definition:
      'Ce que vous payez : l’énergie qui arrive chez vous. L’énergie primaire, elle, compte en plus ce qu’il a fallu dépenser pour la produire et l’acheminer.'
  },
  {
    nom: 'Unité de diagnostic',
    motif: /unit[ée]s? de diagnostic/i,
    definition:
      'Un élément contrôlé séparément : un mur, une porte, une plinthe. Un même logement en compte des dizaines — c’est pourquoi les rapports parlent en nombre d’unités.'
  },
  {
    nom: 'Mérule',
    motif: /m[ée]rules?/i,
    definition:
      'Un champignon qui dévore le bois humide, dans le noir. Il se propage vite et peut atteindre la charpente : c’est le plus redouté des parasites du bâtiment.'
  },
  /*
   * ─────────────────────────────────────────────────────────────────────────
   * LES HUIT MOTS QUE LE LECTEUR DOIT FINIR PAR MAÎTRISER.
   * ─────────────────────────────────────────────────────────────────────────
   *
   * « Verrière ne descend pas au niveau de l'utilisateur pour y rester. Elle
   * l'accompagne vers la compréhension. » L'ordre de mission éditorial nomme
   * douze termes qu'on doit finir par comprendre en se servant du produit —
   * huit manquaient au lexique, dont les plus employés de tous.
   *
   * Ils ne remplacent RIEN : le terme exact reste écrit dans la phrase, et
   * c'est lui qui se souligne. « Liaison équipotentielle supplémentaire » ne
   * devient jamais « fil de sécurité » — ce serait plus simple, et faux
   * pédagogiquement.
   */
  {
    /*
     * LA NUANCE QUE PERSONNE NE FAIT, ET QUI CHANGE TOUT.
     *
     * « Indice d'infestation » ne veut pas dire « il y a des termites chez
     * vous ». Il veut dire : le diagnostiqueur a vu des TRACES — galeries,
     * cordonnets, bois qui sonne creux — sans constater d'insecte vivant le
     * jour de sa visite.
     *
     * Le rapport distingue les deux en toutes lettres, dans deux lignes
     * différentes de son formulaire : « Présence de termites vivants » et
     * « Présence de galeries-tunnels (cordonnets) ou concrétions ».
     *
     * Ce que la définition NE DIT PAS : que l'insecte est parti. Une trace peut
     * être ancienne ou active, et le diagnostic ne tranche pas — c'est
     * précisément pour cela que le rapport recommande un examen plus poussé.
     * On explique le terme ; on n'en tire pas de conclusion à sa place.
     */
    nom: 'Indice d’infestation',
    motif: /indices? d[’']infestation/i,
    definition:
      'Des traces — galeries, cordonnets, bois attaqué — repérées sans qu’un termite vivant ait été vu le jour de la visite. Une trace ne dit pas si l’insecte est encore là.'
  },
  {
    nom: 'DPE',
    motif: /DPE|diagnostic de performance [ée]nerg[ée]tique/i,
    definition:
      'Le diagnostic de performance énergétique. Il classe le logement de A à G sur deux notes — ce qu’il consomme et ce qu’il émet — et la plus mauvaise des deux l’emporte.'
  },
  {
    nom: 'Enveloppe',
    motif: /enveloppes? (?:du |thermique)/i,
    definition:
      'Tout ce qui sépare l’intérieur chauffé de l’extérieur : toiture, murs, fenêtres, plancher bas. C’est par elle que la chaleur s’échappe, avant même qu’il soit question de chauffage.'
  },
  {
    nom: 'Ventilation',
    motif: /ventilations?/i,
    definition:
      'Le renouvellement de l’air. Un logement trop étanche garde son humidité et ses polluants ; un logement trop ouvert perd sa chaleur. Le diagnostic regarde si les entrées et les sorties d’air existent.'
  },
  {
    nom: 'GES',
    motif: /GES|gaz [àa] effet de serre/i,
    definition:
      'Les gaz à effet de serre émis pour chauffer et alimenter le logement, comptés en kilos de CO₂ par mètre carré et par an. C’est la seconde note du DPE, à côté de la consommation.'
  },
  {
    nom: 'Dispositif différentiel',
    motif: /dispositifs? (?:de protection )?diff[ée]rentiels?|diff[ée]rentiel/i,
    definition:
      'L’appareil qui coupe le courant quand il fuit — vers la terre, ou vers quelqu’un. Il ne protège pas les fils, il protège les personnes : c’est ce qui le distingue d’un disjoncteur ordinaire.'
  },
  {
    nom: 'Mise à la terre',
    motif: /mise [àa] la terre|prise de terre/i,
    definition:
      'Un conducteur qui relie l’installation au sol. Il donne au courant de fuite un chemin plus facile que le corps humain — et c’est lui qui permet au différentiel de détecter la fuite.'
  },
  {
    nom: 'Matériau contenant de l’amiante',
    motif: /mat[ée]riaux? contenant de l[’']amiante|MCA/i,
    definition:
      'Un matériau dans lequel de l’amiante a été incorporé à la fabrication : dalle, colle, plaque, calorifugeage. Tant qu’il est intact et qu’on n’y touche pas, il ne libère rien.'
  },
  {
    nom: 'État de conservation',
    motif: /[ée]tats? de conservation/i,
    definition:
      'La cotation que le diagnostiqueur donne à un matériau amianté qu’il a repéré. Elle décide de la suite : une simple surveillance, une évaluation périodique, ou des travaux.'
  },
  {
    nom: 'Concentration en plomb',
    motif: /concentrations? (?:en|de) plomb/i,
    definition:
      'La quantité de plomb mesurée dans un revêtement, en milligrammes par centimètre carré. Le seuil réglementaire est de 1 mg/cm² ; au-dessous, l’unité est classée 0.'
  },
  {
    nom: 'Liaison équipotentielle',
    motif: /liaisons? [ée]quipotentielles?/i,
    definition:
      'Un fil qui relie entre eux les métaux d’une salle d’eau — tuyaux, baignoire, radiateur — pour qu’aucun ne puisse devenir électrique. Sans lui, l’eau et le courant se rencontrent.'
  },
  {
    nom: 'Double seuil',
    motif: /doubles? seuils?/i,
    definition:
      'La règle qui décide de la lettre : on note la consommation, on note le CO₂, et on retient la plus mauvaise des deux notes.'
  },
  {
    nom: 'Saturnisme',
    motif: /saturnismes?/i,
    definition:
      'L’empoisonnement au plomb. Il touche surtout les jeunes enfants, qui portent à la bouche des mains couvertes de poussière, et peut freiner leur développement.'
  },
  {
    nom: 'Loi Carrez',
    motif: /lois? Carrez/i,
    definition:
      'La règle de mesure d’un lot en copropriété — logement, bureau ou local commercial. On compte le sol des pièces, seulement là où le plafond dépasse 1,80 m, sans les murs ni les cloisons. Caves, garages, parkings et lots de moins de 8 m² en sont exclus.'
  },
  {
    nom: 'Classe 3',
    motif: /classes? 3\b/i,
    definition:
      'Le plus haut niveau de plomb : une peinture dégradée, qui s’écaille. C’est le seul qui oblige à agir — les classes 0 à 2 décrivent un revêtement encore intact.'
  },
  {
    nom: 'Loi Boutin',
    motif: /lois? Boutin/i,
    definition:
      'La surface habitable écrite dans un bail de location. Elle ne compte ni les caves, ni les balcons : elle est donc plus petite que la surface totale du logement.'
  }
];

/** Les mots du lexique effectivement employés dans ces textes. */
export function motsEmployes(textes: string[]): Mot[] {
  return LEXIQUE.filter((mot) => textes.some((t) => mot.motif.test(t)));
}
