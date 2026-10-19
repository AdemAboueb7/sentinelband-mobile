/**
 * @file utils/format.js
 * Fonctions de formatage utilisées dans l'interface.
 * Toutes les fonctions sont pures et testables.
 */

// ─── Motifs (reason) ─────────────────────────────────────────────────────────

/** @type {Record<string, string>} */
const REASON_MAP = {
  'CHUTE+IMMOBILITE': 'Chute suivie d\'immobilité',
  'CHUTE_IMMOBILITE': 'Chute suivie d\'immobilité',
  'GAZ_CRITIQUE': 'Gaz dangereux',
  'TEMP_CRITIQUE': 'Température critique',
  'TEMP_ELEVE': 'Température élevée',
  'GAZ_ELEVE': 'Concentration de gaz élevée',
  'CHUTE': 'Chute détectée',
  'IMMOBILITE': 'Immobilité prolongée',
  'MANUEL': 'Déclenchement manuel',
  'TEST': 'Test du système',
};

/**
 * Transforme un code reason brut en libellé lisible en français.
 * @param {string|null|undefined} reason
 * @returns {string}
 */
export function formatReason(reason) {
  if (!reason) return '';
  // NON_CONFIRME_xxx → « Alerte non confirmée »
  if (reason.startsWith('NON_CONFIRME')) return 'Alerte non confirmée';
  // Lookup direct
  const mapped = REASON_MAP[reason.toUpperCase()];
  if (mapped) return mapped;
  // Fallback : remplacer _ et + par des espaces, mettre en minuscules
  return reason
    .replace(/[_+]/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

// ─── Temps relatif ───────────────────────────────────────────────────────────

/**
 * Formate un âge en secondes en texte lisible.
 * @param {number|null|undefined} age_s
 * @returns {string}
 */
export function formatAge(age_s) {
  if (age_s === null || age_s === undefined) return 'jamais';
  const s = Math.round(age_s);
  if (s < 60) return `il y a ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return `il y a ${d} j`;
}

/**
 * Formate une date ISO en heure lisible locale.
 * @param {string|null|undefined} iso
 * @returns {string}
 */
export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// ─── Valeurs capteurs ────────────────────────────────────────────────────────

/**
 * Formate une température en °C.
 * @param {number|null|undefined} v
 * @returns {string}
 */
export function formatTemp(v) {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toFixed(1)} °C`;
}

/**
 * Formate une variation de tension gaz en mV.
 * @param {number|null|undefined} v
 * @returns {string}
 */
export function formatGas(v) {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toFixed(0)} mV`;
}

/**
 * Formate une accélération en g.
 * @param {number|null|undefined} v
 * @returns {string}
 */
export function formatAcc(v) {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toFixed(2)} g`;
}

// ─── Tri des collègues ────────────────────────────────────────────────────────

/** Ordre de gravité pour le tri (plus petit = plus prioritaire) */
const STATE_ORDER = { ROUGE: 0, JAUNE: 1, NORMAL: 2, null: 3 };

/**
 * Compare deux collègues pour le tri par gravité décroissante.
 * @param {{ state: string|null, online: boolean, name: string }} a
 * @param {{ state: string|null, online: boolean, name: string }} b
 * @returns {number}
 */
export function compareColleagues(a, b) {
  const aKey = !a.online ? 3 : (STATE_ORDER[a.state] ?? 3);
  const bKey = !b.online ? 3 : (STATE_ORDER[b.state] ?? 3);
  if (aKey !== bKey) return aKey - bKey;
  return a.name.localeCompare(b.name, 'fr');
}

/**
 * Trie un tableau de collègues par gravité décroissante.
 * @param {Array<object>} colleagues
 * @returns {Array<object>}
 */
export function sortColleagues(colleagues) {
  return [...colleagues].sort(compareColleagues);
}
