export function getImageUrl(path?: string | null) {
    if (!path) return '';
    
    if (/^https?:\/\//i.test(path)) return path;
  
    return path.startsWith('/') ? path : `/${path}`;
  }
  