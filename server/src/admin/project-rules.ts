/**
 * Rules for project keys, names and prefixes. Same as scripts/add-project.sh, so a project
 * added from the dashboard or from the command line looks the same.
 */

/** What apps pass to the widget: `project: 'colorpage'`. Lower case, digits and dashes. Never changes. */
export const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** Short code in references such as CP-12. A letter, then up to 4 letters or digits. Never changes. */
export const PREFIX_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,4}$/;

export const NAME_MAX = 80;

/** Turns what someone typed into the name we store: trimmed, inner spaces collapsed. */
export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ');
