import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/strapi/types';

interface Props {
  posts: BlogPost[];
  heading?: string;
}

/**
 * Server-rendered list of articles for an author/teacher profile.
 * Plain anchor links so Google can follow them from the profile page —
 * gives EEAT (showing the author writes regularly) and pumps authority
 * into the blog posts via the profile's link equity.
 */
export const AuthorArticlesList: React.FC<Props> = ({ posts, heading = 'Artículos publicados' }) => {
  if (posts.length === 0) return null;
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-mx-bg border-t border-mx-border bg-transparent">
      <div className="max-w-5xl mx-auto">
        <span className="text-mx-orange text-label-md tracking-widest uppercase font-semibold mb-3 block">
          Blog
        </span>
        <h2 className="text-heading-md md:text-heading-lg font-black text-mx-blue mb-8 leading-tight">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post) => (
            <li key={post.documentId}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-4 p-4 bg-mx-card border border-mx-border rounded-xl hover:border-mx-orange/40 transition-colors h-full"
              >
                {post.image && (
                  <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-mx-bg">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-body-md font-bold text-mx-text leading-snug group-hover:text-mx-orange transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-body-sm text-mx-text-muted font-light mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
