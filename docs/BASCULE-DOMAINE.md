# Basculer le site sur verriere-diag.fr

> État au 21 août 2026 : **la bascule n'est pas faite.** Le domaine pointe encore
> vers OVH, qui y affiche sa page « site en construction ». L'application, elle,
> tourne normalement sur `exhome.github.io/checkmydiag`.

---

## Le diagnostic, une fois pour toutes

Ce que beaucoup prennent pour une panne de l'application n'en est pas une :

| Ce qu'on voit | Ce que c'est |
|---|---|
| « Site en construction » sur `verriere-diag.fr` | La **page de parking d'OVH**. Elle n'est pas dans ce dépôt. |
| `verriere-diag.fr` répond en 200 | C'est OVH qui répond, pas GitHub. |
| `exhome.github.io/checkmydiag` répond | **L'application, intacte.** |

Il n'y a donc jamais rien à « remettre en place » dans le code. Le seul geste
est chez OVH.

---

## L'ordre compte — et il n'est pas intuitif

**Les DNS d'abord. Le `CNAME` ensuite.** Jamais l'inverse.

Le fichier `public/CNAME` existe déjà dans le dossier de travail, **volontairement
non suivi par git**. Le pousser avant que les DNS ne pointent vers GitHub ferait
basculer Pages sur un domaine qui répond ailleurs : `exhome.github.io/checkmydiag`
redirigerait alors vers la page OVH, et **le site deviendrait inaccessible sans
qu'aucune erreur ne s'affiche nulle part.** C'est le pire genre de panne.

---

## 1. Chez OVH

Noms de domaine → `verriere-diag.fr` → **Zone DNS** → **Modifier en mode textuel**.

Remplacer tout le contenu par ceci :

```
$TTL 3600
@	IN SOA dns106.ovh.net. tech.ovh.net. (2087145964 86400 3600 3600000 60)
	IN NS	dns106.ovh.net.
	IN NS	ns106.ovh.net.
	IN MX	100 mx3.mail.ovh.net.
	IN MX	1 mx1.mail.ovh.net.
	IN MX	5 mx2.mail.ovh.net.
	IN A	185.199.108.153
	IN A	185.199.109.153
	IN A	185.199.110.153
	IN A	185.199.111.153
	IN TXT	"v=spf1 include:mx.ovh.com -all"
	IN TXT	"1|www.verriere-diag.fr"
ftp	IN CNAME	verriere-diag.fr.
www	IN CNAME	exhome.github.io.
```

**Ce qui change :** l'unique `A` de l'apex (`213.186.33.5`) devient les quatre
adresses de GitHub Pages, et le `www` passe de `A` à `CNAME`.

**Ce qui ne change pas :** les trois `MX` et le `SPF`. Les mails ne bougent pas.

**Une ligne disparaît volontairement :** `www IN TXT "3|welcome"`. Un `CNAME` ne
peut pas cohabiter avec un autre enregistrement sur le même nom — c'est la règle
DNS, et OVH refuserait.

> **Vérifier après validation.** Le 20 août, OVH a affiché « la configuration
> sera importée dans quelques instants » et l'import n'a jamais pris : la zone
> était revenue à `213.186.33.5` le lendemain. Rouvrir la zone et confirmer que
> les quatre `185.199.…` y sont bien.

---

## 2. Attendre la propagation

```bash
nslookup verriere-diag.fr 1.1.1.1
```

Tant que la réponse est `213.186.33.5`, **ne rien pousser**. Quand elle affiche
`185.199.108.153`, c'est bon. Compter une à deux heures avec un TTL de 3 600.

---

## 3. Pousser le CNAME

```bash
git add public/CNAME && git commit -m "Le site prend son nom de domaine" && git push
```

Le build n'a rien à changer : la `base` de Vite vaut déjà `'./'` et le manifest
utilise des chemins relatifs. L'application fonctionne telle quelle sur un
domaine racine comme sur un sous-chemin.

---

## 4. Le certificat, et le piège de l'apex

Dans les réglages **Pages** du dépôt, vérifier que le domaine est reconnu, puis
activer **Enforce HTTPS** dès que le certificat est émis — quelques minutes à une
heure.

> C'est exactement à cette étape que l'apex HTTPS s'était cassé sur le site DGLM.
> Le certificat ne s'émet que si les **quatre** adresses `A` sont présentes ;
> avec trois, il échoue en silence.

---

## Revenir en arrière

Si quelque chose tourne mal : supprimer `public/CNAME`, commiter, pousser. Le
site redevient accessible sur `exhome.github.io/checkmydiag` en quelques minutes.
