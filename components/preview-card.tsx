import { PreviewData } from '@/lib/store';
import { ExternalLink, Tag } from 'lucide-react';
import Image from 'next/image';

interface PreviewCardProps {
  data: PreviewData;
  url: string;
}

export function PreviewCard({ data, url }: PreviewCardProps) {
  const displayUrl = data.url || url;
  const domain = data.domain || new URL(url).hostname;

  return (
    <a 
      href={displayUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 w-full max-w-2xl mx-auto"
    >
      {data.image ? (
        <div className="relative w-full h-[300px] bg-gray-100 overflow-hidden">
          {/* Using img tag with Next.js specific rules bypassed for external unknown domains, or use unoptimized if permitted.
              I'll use standard img to avoid Next.js domain config issues for arbitrary domains. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={data.image} 
            alt={data.title || 'Preview'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
          <ExternalLink className="w-8 h-8 opacity-50" />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {data.favicon && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.favicon} alt="Favicon" className="w-4 h-4 rounded-sm" />
          )}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {data.siteName || domain}
          </span>
          {data.articlePublishedTime && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                {new Date(data.articlePublishedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
          {data.title || url}
        </h3>
        
        {data.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
            {data.description}
          </p>
        )}

        {(data.articleAuthor || data.type || (data.keywords && data.keywords.length > 0)) && (
          <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {data.articleAuthor && (
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                By {data.articleAuthor}
              </span>
            )}
            {data.type && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md capitalize">
                {data.type.replace('article', 'Article').replace('website', 'Website')}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
