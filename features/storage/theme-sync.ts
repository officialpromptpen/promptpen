import { browser } from "wxt/browser";

const THEME_RAW_KEY = "promptpen-theme";

let target: EventTarget | null = null;

export function getThemeChangeTarget(): EventTarget {
  if (target) {
    return target;
  }
  target = new EventTarget();
  browser.storage.sync.onChanged.addListener((changes) => {
    const change = changes[THEME_RAW_KEY];
    if (change == null) {
      return;
    }
    target!.dispatchEvent(
      new CustomEvent("change", { detail: change.newValue })
    );
  });
  return target;
}
