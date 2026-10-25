/**
 * Saisie vocale via Web Speech API (navigateur). Aucune clé API.
 * Support : Chrome/Edge/Android ; Safari iOS 14.5+ (webkitSpeechRecognition).
 */
export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechResultEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'fr-FR';
  recognition.continuous = false;
  recognition.interimResults = true;
  return recognition;
}

/** Mots-clés par catégorie (normalisés : minuscules, sans accents). */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  alimentation: [
    'alimentation',
    'nourriture',
    'repas',
    'resto',
    'restaurant',
    'course',
    'courses',
    'manger',
    'bouffe',
    'supermarché',
    'marche',
    'pain',
    'riz',
    'boisson',
  ],
  transport: [
    'transport',
    'taxi',
    'bus',
    'essence',
    'carburant',
    'zem',
    'moto',
    'voiture',
    'péage',
    'gazoil',
    'diesel',
    'trajet',
  ],
  logement: ['logement', 'loyer', 'maison', 'électricité', 'courant', 'eau'],
  santé: [
    'santé',
    'pharmacie',
    'médecin',
    'hôpital',
    'consultation',
    'médicament',
    'docteur',
  ],
  loisirs: ['loisir', 'cinéma', 'sortie', 'jeu', 'jeux', 'sport', 'abonnement', 'bar'],
  factures: ['facture', 'internet', 'téléphone', 'forfait', 'wifi'],
  shopping: ['shopping', 'vêtement', 'habit', 'chaussure', 'achat', 'fringue'],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Devine la catégorie d'une dépense à partir de mots-clés prononcés. */
export function guessCategoryId(
  transcript: string,
  categories: { id: string; name: string }[],
): string | null {
  const text = normalize(transcript);

  for (const [key, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((word) => text.includes(normalize(word)))) {
      const match = categories.find((c) => {
        const name = normalize(c.name);
        return name === key || name.includes(key) || key.includes(name);
      });
      if (match) return match.id;
    }
  }

  for (const category of categories) {
    if (text.includes(normalize(category.name))) {
      return category.id;
    }
  }
  return null;
}

/**
 * Extrait le premier montant de la phrase.
 * Gère « 5 000 », « 5.000 », « 5,50 », « 5 000 FCFA », « 7500f ».
 */
export function extractAmountCents(transcript: string): number | null {
  const cleaned = transcript.replace(/(fcfa|francs?|f\b|euros?|€|\$)/gi, ' ');
  const match = cleaned.match(/(\d{1,3}(?:[ .]\d{3})+|\d+(?:,\d{1,2})?)/);
  if (!match) return null;

  const raw = match[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export interface VoiceParse {
  transcript: string;
  amountCents: number | null;
  categoryId: string | null;
}

export function parseVoice(
  transcript: string,
  categories: { id: string; name: string }[],
): VoiceParse {
  return {
    transcript,
    amountCents: extractAmountCents(transcript),
    categoryId: guessCategoryId(transcript, categories),
  };
}
