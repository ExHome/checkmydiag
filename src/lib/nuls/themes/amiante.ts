import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const AMIANTE: Theme = {
  id: 'amiante',
  titre: 'Amiante',
  h1: 'L’amiante dans un logement : ce que dit le repérage',
  resume:
    'Trouver de l’amiante chez soi n’oblige presque jamais à l’enlever. Ce qui compte, c’est son état et ce que vous comptez en faire. Voici comment lire un repérage sans paniquer — et sans le prendre à la légère.',
  dessin: 'amiante-etat',

  questions: [
    {
      id: 'c-est-quoi-l-amiante',
      question: 'Pourquoi l’amiante est-elle dangereuse ?',
      variantes: [
        'amiante danger santé',
        'amiante interdite depuis quand',
        'fibres d’amiante risque'
      ],
      court:
        'Parce qu’elle se casse en fibres microscopiques qui restent des heures en suspension dans l’air, et que ces fibres se logent au fond des poumons. Les maladies qu’elles provoquent apparaissent vingt à quarante ans plus tard.',
      dessin: 'amiante-etat',
      points: [
        'L’amiante était un excellent matériau : incombustible, isolant, résistant, bon marché. C’est pour ça qu’elle est partout dans le bâti d’avant 1997.',
        'Elle est interdite en France depuis le 1ᵉʳ janvier 1997 ; le seuil retenu pour les diagnostics est le permis de construire délivré avant le 1ᵉʳ juillet 1997.',
        'Le danger vient de l’inhalation des fibres, pas du contact. Un matériau intact et non manipulé ne libère rien.',
        'C’est la manipulation qui libère : percer, scier, poncer, casser, démolir.',
        'Aucune dose n’est reconnue sans risque, ce qui explique la sévérité de la réglementation du travail.'
      ],
      piege:
        'On imagine l’amiante comme une matière blanche et poudreuse. Le plus souvent, elle est prise dans du ciment, de la colle ou un revêtement de sol : invisible, dure, et parfaitement inoffensive tant qu’on la laisse tranquille.',
      aussi: ['ou-trouve-t-on-de-l-amiante', 'j-ai-de-l-amiante-que-faire', 'amiante-et-travaux'],
      savoir: ['fibrociment'],
      sources: [{ titre: 'Décret n° 96-1133 du 24 décembre 1996 (interdiction de l’amiante)', url: LEGI }],
      verifie: V
    },

    {
      id: 'ou-trouve-t-on-de-l-amiante',
      question: 'Où trouve-t-on de l’amiante dans une maison ?',
      variantes: [
        'amiante où chercher maison',
        'dalles de sol amiante',
        'toiture fibrociment amiante',
        'amiante colle carrelage'
      ],
      court:
        'Presque partout dans le bâti d’avant 1997 : la toiture et les descentes en fibres-ciment, les dalles de sol de 30 cm et leur colle noire, les conduits de fumée, les enduits, et les protections autour des chaudières.',
      dessin: 'amiante-listes',
      points: [
        'Les plaques ondulées de toiture et les gouttières en fibres-ciment sont le cas le plus courant en maison.',
        'Les dalles vinyle-amiante de 30 × 30 cm, souvent posées dans les années 1960-1980, avec une colle noire elle-même amiantée.',
        'Les conduits de cheminée, les gaines techniques et les protections thermiques derrière un appareil de chauffage.',
        'Les flocages et calorifugeages — les plus dangereux — se rencontrent surtout dans les immeubles et les locaux techniques.',
        'Les enduits, mastics de fenêtre et joints d’étanchéité en contiennent parfois : c’est ce qui rend le repérage avant travaux indispensable.'
      ],
      piege:
        'On cherche l’amiante dans les murs, alors qu’elle est le plus souvent sous les pieds et sur le toit. Les dalles de sol et les plaques de couverture sont, de loin, les deux cas les plus fréquents en maison.',
      chezMoi:
        'Votre rapport liste les matériaux repérés avec leur localisation précise. Cherchez la colonne « état de conservation » : c’est elle qui commande la suite.',
      aussi: ['c-est-quoi-l-amiante', 'c-est-quoi-les-listes-a-b-c', 'j-ai-de-l-amiante-que-faire'],
      savoir: ['fibrociment', 'amiante'],
      verifie: V
    },

    {
      id: 'c-est-quoi-les-listes-a-b-c',
      question: 'Listes A, B et C : c’est quoi la différence ?',
      variantes: [
        'liste A liste B amiante',
        'repérage amiante avant travaux liste C',
        'flocage calorifugeage définition'
      ],
      court:
        'Trois familles de matériaux, classées par leur facilité à libérer des fibres. La liste A regroupe les matériaux friables — les plus dangereux. La liste B, ceux qui sont stables tant qu’on n’y touche pas. La liste C n’est cherchée qu’avant démolition.',
      dessin: 'amiante-listes',
      points: [
        'Liste A : flocages, calorifugeages, faux plafonds. Ils poudrent au moindre choc, et leur surveillance est la plus stricte.',
        'Liste B : toitures, dalles de sol, conduits, canalisations. Stables, mais dangereux dès qu’on les travaille.',
        'Liste C : tout le reste, cherché seulement avant démolition — le repérage va alors jusque dans les parois.',
        'Un repérage avant vente ne couvre que les listes A et B, et seulement ce qui est visible.',
        'Avant des travaux, un repérage spécifique est obligatoire : il est bien plus poussé que celui de la vente.'
      ],
      piege:
        'Un rapport de vente qui conclut « absence d’amiante » ne veut pas dire qu’il n’y en a pas dans le bâtiment. Il veut dire qu’il n’y en a pas dans les matériaux des listes A et B qui étaient visibles ce jour-là.',
      aussi: ['ou-trouve-t-on-de-l-amiante', 'amiante-et-travaux', 'le-diagnostiqueur-regarde-quoi'],
      savoir: ['amiante', 'fibre-amiante'],
      sources: [{ titre: 'Code de la santé publique, annexe 13-9', url: LEGI }],
      verifie: V
    },

    {
      id: 'j-ai-de-l-amiante-que-faire',
      question: 'Le rapport trouve de l’amiante chez moi : je dois l’enlever ?',
      variantes: [
        'amiante détectée obligation travaux',
        'désamiantage obligatoire ou pas',
        'vivre avec de l’amiante'
      ],
      court:
        'Presque jamais. Un matériau en bon état, laissé en place et non manipulé, ne présente pas de risque : la règle est de le surveiller, pas de l’arracher. Le retrait s’impose seulement quand l’état se dégrade.',
      dessin: 'amiante-etat',
      points: [
        'Chaque matériau repéré reçoit une évaluation de son état, qui commande la suite : surveillance périodique, mesure d’empoussièrement, ou travaux.',
        'Pour les matériaux friables très dégradés, des travaux de retrait ou de confinement sont imposés dans un délai réglementaire.',
        'Un retrait mal fait est bien plus dangereux que le matériau laissé en place : c’est la manipulation qui libère les fibres.',
        'Les déchets d’amiante ne vont pas à la déchèterie ordinaire : ils suivent une filière dédiée, avec bordereau.',
        'Conservez le rapport : il devra être remis à toute entreprise intervenant sur le bâtiment.'
      ],
      piege:
        'Enlever soi-même des plaques de toiture en fibres-ciment, un week-end, à la disqueuse : c’est le geste qui expose le plus de particuliers en France. Une plaque se dépose entière, humidifiée, sans jamais être découpée.',
      chezMoi:
        'Cherchez dans votre rapport la colonne d’état de conservation, et la recommandation associée à chaque matériau. C’est là que se joue la différence entre « on surveille » et « on agit ».',
      aussi: ['amiante-et-travaux', 'c-est-quoi-les-listes-a-b-c', 'c-est-quoi-l-amiante'],
      verifie: V
    },

    {
      id: 'amiante-et-travaux',
      question: 'Je veux faire des travaux : que dois-je vérifier ?',
      variantes: [
        'repérage amiante avant travaux obligatoire',
        'percer un mur amiante',
        'entreprise certifiée désamiantage'
      ],
      court:
        'Avant toute intervention sur un bâtiment d’avant juillet 1997, un repérage amiante avant travaux est obligatoire — et il incombe au donneur d’ordre, c’est-à-dire à vous. Il est bien plus poussé que celui remis à la vente.',
      points: [
        'Ce repérage cherche dans les zones qui seront touchées, y compris en sondant les parois.',
        'Il protège les compagnons qui interviennent : sans lui, une entreprise sérieuse refusera le chantier.',
        'Le retrait d’amiante relève d’entreprises certifiées, avec confinement, protection et évacuation en filière.',
        'Pour les petites interventions, une qualification spécifique existe : demandez-la, elle se justifie par un document.',
        'Ne poncez, ne percez, ne sciez jamais un matériau susceptible d’en contenir avant d’avoir la réponse.'
      ],
      piege:
        'Beaucoup de particuliers pensent que ce repérage ne concerne que les professionnels. C’est le donneur d’ordre qui en est responsable — même quand c’est un propriétaire qui fait poser une fenêtre.',
      aussi: ['j-ai-de-l-amiante-que-faire', 'c-est-quoi-les-listes-a-b-c', 'ou-trouve-t-on-de-l-amiante'],
      sources: [{ titre: 'Code du travail, article R. 4412-97', url: LEGI }],
      verifie: V
    },

    {
      id: 'dta-et-dapp',
      question: 'En immeuble : c’est quoi le DTA et le DAPP ?',
      variantes: [
        'dossier technique amiante copropriété',
        'DAPP parties privatives',
        'amiante parties communes immeuble'
      ],
      court:
        'Deux documents distincts. Le DTA — dossier technique amiante — porte sur les parties communes de l’immeuble et appartient à la copropriété. Le DAPP porte sur les parties privatives de votre logement.',
      points: [
        'Le DTA est tenu par le syndic, tenu à jour, et consultable par tout occupant ou intervenant.',
        'Le DAPP concerne les logements des immeubles collectifs d’avant juillet 1997 ; il est remis au locataire sur sa demande.',
        'Pour vendre, c’est encore un autre document qu’il vous faut : le constat amiante « parties privatives » établi pour la vente.',
        'Trois documents, trois périmètres : c’est la principale source de confusion en copropriété.',
        'Toute entreprise intervenant dans les communs doit se voir remettre la fiche récapitulative du DTA.'
      ],
      aussi: ['c-est-quoi-les-listes-a-b-c', 'quels-diagnostics-pour-louer', 'ou-trouve-t-on-de-l-amiante'],
      sources: [{ titre: 'Code de la santé publique, articles R. 1334-29-4 et suivants', url: LEGI }],
      verifie: V
    },

    {
      id: 'comment-savoir-si-c-est-de-l-amiante',
      question: 'Comment savoir si un matériau contient de l’amiante ?',
      variantes: [
        'reconnaître l’amiante',
        'analyse amiante laboratoire',
        'dalle de sol amiante comment savoir'
      ],
      court:
        'À l’œil, on ne peut pas en être sûr — jamais. On peut soupçonner d’après la date et le type de matériau, mais seule une analyse en laboratoire accrédité répond. Un prélèvement se fait par un professionnel, pas au couteau un dimanche.',
      dessin: 'amiante-etat',
      points: [
        'Les indices sérieux : un bâtiment d’avant juillet 1997, des plaques ondulées grises, des dalles de sol de 30 × 30 cm, une colle noire, un conduit gris fibreux.',
        'Beaucoup de matériaux ressemblants n’en contiennent pas : des plaques de fibres-ciment récentes, par exemple, en sont exemptes.',
        'Le prélèvement se fait humidifié, avec protection, et part dans un laboratoire accrédité. Le résultat est écrit, daté, opposable.',
        'Gratter, casser ou poncer pour « voir » est précisément le geste qui libère les fibres.',
        'Si le doute porte sur un chantier à venir, c’est le repérage avant travaux qui répond, et il est obligatoire.'
      ],
      piege:
        'Les moteurs de recherche regorgent de photos censées permettre de reconnaître l’amiante. Aucune ne vaut analyse : deux plaques identiques peuvent différer, selon l’année et l’usine.',
      chezMoi:
        'Si votre rapport mentionne un matériau « susceptible de contenir de l’amiante » sans conclusion ferme, c’est qu’aucun prélèvement n’a été fait. Le doute reste entier — et il se lève par une analyse, pas par une photo.',
      aussi: ['amiante-et-travaux', 'ou-trouve-t-on-de-l-amiante', 'j-ai-de-l-amiante-que-faire'],
      savoir: ['fibrociment'],
      verifie: V
    }
  ]
};
