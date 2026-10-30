// Display wording only; original image provenance remains in API/catalog metadata.
export const formatCatalogText = value => typeof value === 'string'
  ? value
    .replace(/Ảnh minh họa AI\.\s*/gu, '')
    .replace(/Ảnh trước và sau là minh họa AI, /gu, 'Ảnh trước và sau minh họa ý tưởng; ')
    .trim()
  : '';
