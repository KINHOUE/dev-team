/** Petit utilitaire de fusion de classes (sans dépendance). */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
