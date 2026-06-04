import { fetchOGMetadata } from '@/lib/og-parser';
import { notFound } from 'next/navigation';

export default async function EmbedPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = await searchParams;
  if (!params.url) {
    return notFound();
  }

  let data;
  try {
    data = await fetchOGMetadata(params.url);
  } catch (error) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '1rem', border: '1px solid #fee2e2', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b' }}>
        Preview not available format
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <a href={data.url || params.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '0.5rem', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          maxWidth: '500px'
        }}>
          {data.image && (
            <div style={{ height: '240px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt={data.title || 'Preview'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {data.favicon && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={data.favicon} alt="favicon" style={{ width: '16px', height: '16px', borderRadius: '2px' }} />
              )}
              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {data.domain || 'Website'}
              </span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#111827', lineHeight: 1.4 }}>
              {data.title || params.url}
            </h3>
            {data.description && (
              <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {data.description}
              </p>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
