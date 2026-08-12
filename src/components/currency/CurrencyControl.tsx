"use client";

import { useSyncExternalStore } from "react";
import {
  CURRENCY_ATTRIBUTE,
  CURRENCY_COOKIE_NAME,
  CURRENCY_OPTIONS,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [CURRENCY_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

function getSnapshot(): CurrencyCode {
  const value = document.documentElement.getAttribute(CURRENCY_ATTRIBUTE);
  return isCurrencyCode(value) ? value : DEFAULT_CURRENCY;
}

function getServerSnapshot(): CurrencyCode {
  return DEFAULT_CURRENCY;
}

function writeCookie(currency: CurrencyCode) {
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${CURRENCY_COOKIE_NAME}=${encodeURIComponent(currency)}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch {
    // Ignore cookie failures (privacy modes).
  }
}

export function applyCurrency(next: CurrencyCode) {
  document.documentElement.setAttribute(CURRENCY_ATTRIBUTE, next);
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  } catch {
    // Private-mode browsers block storage; the choice still applies for this session.
  }
  writeCookie(next);
}

/** Current display/quote currency (document attribute is source of truth after bootstrap). */
export function useCurrency(): CurrencyCode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Compact currency switcher for the site header.
 * Changing currency requotes via LiteAPI on the next rates fetch — no client FX conversion.
 */
export function CurrencyControl({ className = "" }: { className?: string }) {
  const currency = useCurrency();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label htmlFor="site-currency" className="text-xs font-medium text-ink-muted">
        Currency
      </label>
      <select
        id="site-currency"
        value={currency}
        onChange={(event) => applyCurrency(event.target.value as CurrencyCode)}
        className="h-8 rounded-control border border-border bg-surface px-2 text-[0.8125rem] font-medium text-ink"
        aria-label="Display currency"
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Before paint: restore a saved currency, or detect once from language/timezone
 * and persist so Swedish visitors land on SEK without hunting for a control.
 */
export const currencyBootstrapScript = `(function(){try{var k=${JSON.stringify(CURRENCY_STORAGE_KEY)},a=${JSON.stringify(CURRENCY_ATTRIBUTE)},c=${JSON.stringify(CURRENCY_COOKIE_NAME)},d=document.documentElement,v=null;try{v=localStorage.getItem(k);}catch(e){}function ok(x){return x==="EUR"||x==="SEK"||x==="GBP"||x==="USD";}if(!ok(v)){var langs=[];try{langs=(navigator.languages&&navigator.languages.length)?Array.prototype.slice.call(navigator.languages):[navigator.language];}catch(e){}var picked="",i,tag,parts,lang,region,tz;for(i=0;i<langs.length;i++){tag=String(langs[i]||"").toLowerCase().replace("_","-");parts=tag.split("-");lang=parts[0];region=parts[1]||"";if(lang==="sv"||region==="se"){picked="SEK";break;}if(region==="gb"||tag==="en-gb"){picked="GBP";break;}if(region==="us"||tag==="en-us"){picked="USD";break;}if(region==="de"||region==="fr"||region==="es"||region==="it"||region==="nl"||region==="at"||region==="pt"||region==="ie"||region==="fi"||region==="be"||lang==="de"||lang==="fr"||lang==="es"||lang==="it"||lang==="nl"||lang==="pt"){picked="EUR";break;}}try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){tz="";}if(!picked){if(tz==="Europe/Stockholm")picked="SEK";else if(tz==="Europe/London")picked="GBP";else if(tz==="America/New_York"||tz==="America/Chicago"||tz==="America/Denver"||tz==="America/Los_Angeles"||tz==="America/Phoenix")picked="USD";else picked="EUR";}else if(picked==="EUR"&&tz==="Europe/Stockholm"){picked="SEK";}v=picked;try{localStorage.setItem(k,v);}catch(e){}}d.setAttribute(a,v);try{document.cookie=c+"="+encodeURIComponent(v)+"; path=/; max-age=31536000; samesite=lax";}catch(e){}}catch(e){}})();`;
