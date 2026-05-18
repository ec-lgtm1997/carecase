const KEY = "ccm.sync_code.v1";

export function getSyncCode(): string {
  if (typeof window === "undefined") return "";
  let code = window.localStorage.getItem(KEY);
  if (!code) {
    code = crypto.randomUUID();
    window.localStorage.setItem(KEY, code);
  }
  return code;
}

export function setSyncCode(code: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, code.trim());
}
