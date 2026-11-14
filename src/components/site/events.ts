export const OPEN_MASTER_EVENT = "sto:open-master";

export function openMaster(prompt?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_MASTER_EVENT, { detail: { prompt } }));
}
