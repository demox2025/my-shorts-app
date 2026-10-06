export function normalizeVideoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  if (trimmed.includes('dropbox.com')) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.hostname = 'dl.dropboxusercontent.com';
      urlObj.searchParams.delete('dl');
      urlObj.searchParams.set('raw', '1');
      return urlObj.toString();
    } catch {
      let converted = trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com');
      return converted.replace(/[?&]dl=0/, '?raw=1');
    }
  }
  return trimmed;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '০ KB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return (bytes / 1024).toFixed(1) + ' KB';
  return mb.toFixed(2) + ' MB';
}
