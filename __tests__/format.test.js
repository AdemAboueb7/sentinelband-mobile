/**
 * @file __tests__/format.test.js
 * Tests unitaires des fonctions de formatage.
 */

import {
  formatReason,
  formatAge,
  formatTemp,
  formatGas,
  formatAcc,
  sortColleagues,
  compareColleagues,
} from '../src/utils/format';

// ─── formatReason ─────────────────────────────────────────────────────────────

describe('formatReason', () => {
  test('CHUTE+IMMOBILITE → libellé correct', () => {
    expect(formatReason('CHUTE+IMMOBILITE')).toBe("Chute suivie d'immobilité");
  });

  test('GAZ_CRITIQUE → libellé correct', () => {
    expect(formatReason('GAZ_CRITIQUE')).toBe('Gaz dangereux');
  });

  test('TEMP_CRITIQUE → libellé correct', () => {
    expect(formatReason('TEMP_CRITIQUE')).toBe('Température critique');
  });

  test('NON_CONFIRME_xxx → alerte non confirmée', () => {
    expect(formatReason('NON_CONFIRME_123')).toBe('Alerte non confirmée');
    expect(formatReason('NON_CONFIRME')).toBe('Alerte non confirmée');
  });

  test('null → chaîne vide', () => {
    expect(formatReason(null)).toBe('');
    expect(formatReason(undefined)).toBe('');
    expect(formatReason('')).toBe('');
  });

  test('code inconnu → fallback lisible', () => {
    const result = formatReason('TOTO_TATA');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── formatAge ────────────────────────────────────────────────────────────────

describe('formatAge', () => {
  test('null → jamais', () => {
    expect(formatAge(null)).toBe('jamais');
    expect(formatAge(undefined)).toBe('jamais');
  });

  test('secondes < 60', () => {
    expect(formatAge(12)).toBe('il y a 12 s');
    expect(formatAge(0)).toBe('il y a 0 s');
  });

  test('minutes', () => {
    expect(formatAge(90)).toBe('il y a 2 min');
  });

  test('heures', () => {
    expect(formatAge(3600)).toBe('il y a 1 h');
  });

  test('jours', () => {
    expect(formatAge(86400)).toBe('il y a 1 j');
  });
});

// ─── Formatage capteurs ───────────────────────────────────────────────────────

describe('formatTemp', () => {
  test('valeur normale', () => {
    expect(formatTemp(25.34)).toBe('25.3 °C');
  });
  test('null → tiret', () => {
    expect(formatTemp(null)).toBe('—');
  });
});

describe('formatGas', () => {
  test('valeur normale', () => {
    expect(formatGas(123.6)).toBe('124 mV');
  });
  test('null → tiret', () => {
    expect(formatGas(null)).toBe('—');
  });
});

describe('formatAcc', () => {
  test('valeur normale', () => {
    expect(formatAcc(1.234)).toBe('1.23 g');
  });
  test('null → tiret', () => {
    expect(formatAcc(null)).toBe('—');
  });
});

// ─── sortColleagues ───────────────────────────────────────────────────────────

describe('sortColleagues', () => {
  const colleagues = [
    { id: 1, name: 'Alice', state: 'NORMAL', online: true },
    { id: 2, name: 'Bob', state: 'ROUGE', online: true },
    { id: 3, name: 'Charlie', state: 'JAUNE', online: true },
    { id: 4, name: 'Diana', state: 'NORMAL', online: false },
    { id: 5, name: 'Eve', state: 'ROUGE', online: true },
  ];

  const sorted = sortColleagues(colleagues);

  test('ROUGE en premier', () => {
    expect(sorted[0].state).toBe('ROUGE');
    expect(sorted[1].state).toBe('ROUGE');
  });

  test('JAUNE après ROUGE', () => {
    expect(sorted[2].state).toBe('JAUNE');
  });

  test('NORMAL après JAUNE', () => {
    expect(sorted[3].state).toBe('NORMAL');
  });

  test('Hors ligne en dernier', () => {
    expect(sorted[4].online).toBe(false);
  });

  test('Tri alphabétique à gravité égale', () => {
    // Bob et Eve sont tous les deux ROUGE
    const redOnes = sorted.filter((c) => c.state === 'ROUGE' && c.online);
    expect(redOnes[0].name).toBe('Bob');
    expect(redOnes[1].name).toBe('Eve');
  });

  test('Ne modifie pas le tableau original', () => {
    const original = [...colleagues];
    sortColleagues(colleagues);
    expect(colleagues.map((c) => c.id)).toEqual(original.map((c) => c.id));
  });
});

describe('compareColleagues', () => {
  test('ROUGE < JAUNE', () => {
    const a = { state: 'ROUGE', online: true, name: 'A' };
    const b = { state: 'JAUNE', online: true, name: 'B' };
    expect(compareColleagues(a, b)).toBeLessThan(0);
  });

  test('Hors ligne en dernier', () => {
    const a = { state: 'NORMAL', online: false, name: 'A' };
    const b = { state: 'NORMAL', online: true, name: 'B' };
    expect(compareColleagues(a, b)).toBeGreaterThan(0);
  });
});
