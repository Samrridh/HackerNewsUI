/** Render HN item HTML (titles/text use limited tags from the Firebase API). */
export function hnHtml(html) {
  if (!html) return { __html: '' };
  return { __html: html };
}

export function hnOpenUrl(id) {
  return `https://news.ycombinator.com/item?id=${id}`;
}

export function hnVoteUrl(id) {
  return `https://news.ycombinator.com/vote?id=${id}&how=up`;
}

/** Absolute in-app discussion URL (production origin for shareable links). */
export function appItemUrl(id, origin = 'https://hn.weaveit.app') {
  return `${origin.replace(/\/$/, '')}/item/${id}`;
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
