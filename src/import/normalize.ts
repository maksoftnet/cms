export interface UnifiedPageData {
  title: string;
  content: string;
  language?: string;
  platformMeta?: any;
}

export function normalizeFromXml(parsedXml: any): UnifiedPageData[] {
  const pages: UnifiedPageData[] = [];
  const items = parsedXml.root?.item || parsedXml.channel?.item || [];

  for (const item of Array.isArray(items) ? items : [items]) {
    pages.push({
      title: item.title || '',
      content: item.description || item.content || '',
      language: item.language || 'bg',
      platformMeta: item
    });
  }

  return pages;
}
