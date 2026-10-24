/**
 * LiteAPI / partner feeds sometimes ship Latin-1 street names with `?` instead
 * of umlauts or ß. Repair the patterns we see on live DE/AT addresses.
 */
export function repairLiteApiText(value: string | null | undefined): string {
  if (!value) return "";
  let text = value;

  text = text.replace(/stra\?e/gi, (match) => (match[0] === "S" ? "Straße" : "straße"));
  text = text.replace(/str\?e/gi, (match) => (match[0] === "S" ? "Straße" : "straße"));
  text = text.replace(/([Gg])\?rtel/g, "$1ürtel");
  text = text.replace(/([Mm])\?nchen/g, "$1ünchen");
  text = text.replace(/([Kk])\?ln/g, "$1öln");
  text = text.replace(/([Ww])\?rzburg/g, "$1ürzburg");
  text = text.replace(/([Gg])\?ttingen/g, "$1öttingen");
  text = text.replace(/([Ll])\?beck/g, "$1übeck");
  text = text.replace(/([Nn])\?rnberg/g, "$1ürnberg");
  text = text.replace(/([Dd])\?sseldorf/g, "$1üsseldorf");
  text = text.replace(/([Tt])\?bingen/g, "$1übingen");
  text = text.replace(/([Ff])\?rth/g, "$1ürth");
  text = text.replace(/([Bb])\?blingen/g, "$1öblingen");
  text = text.replace(/([Gg])\?nzburg/g, "$1ünzburg");
  text = text.replace(/([Ww])i\?en/g, "$1ien");
  text = text.replace(/([Oo])\?sterreich/g, "$1sterreich");
  text = text.replace(/([Aa])m\s+G\?rtel/g, "Am Gürtel");
  text = text.replace(/Wei\?e/g, "Weiße");
  text = text.replace(/wei\?e/g, "weiße");
  text = text.replace(/gro\?/gi, (m) => (m[0] === "G" ? "Groß" : "groß"));
  text = text.replace(/Gr\?nd/g, "Gründ");
  text = text.replace(/gr\?nd/g, "gründ");

  return text;
}
