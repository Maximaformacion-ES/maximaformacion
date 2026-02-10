'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/strapi/types';
import { BlogTableOfContents } from './BlogTableOfContents';

interface BlogContentProps {
  post: BlogPost;
}

export const BlogContent: React.FC<BlogContentProps> = ({ post }) => {
  return (
    <>
      <style jsx global>{`
        .blog-html-content {
          color: var(--color-mx-text-muted);
          font-size: 1rem;
          line-height: 1.7;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* Heading scroll offset for TOC navigation */
        .blog-html-content h1,
        .blog-html-content h2,
        .blog-html-content h3,
        .blog-html-content h4 {
          scroll-margin-top: 7rem;
        }

        /* Headings */
        .blog-html-content h1 {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--color-mx-blue);
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .blog-html-content h2 {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--color-mx-blue);
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }

        .blog-html-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--color-mx-text);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-html-content h4 {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.4;
          color: var(--color-mx-text);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        /* Paragraphs */
        .blog-html-content p {
          color: var(--color-mx-text-muted);
          font-weight: 300;
          line-height: 1.75;
          margin-bottom: 1.5rem;
        }

        /* Lists */
        .blog-html-content ul,
        .blog-html-content ol {
          color: var(--color-mx-text-muted);
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .blog-html-content li {
          margin-bottom: 0.75rem;
          line-height: 1.75;
        }

        .blog-html-content ul li {
          list-style-type: disc;
        }

        .blog-html-content ol li {
          list-style-type: decimal;
        }

        /* Strong and Emphasis */
        .blog-html-content strong {
          color: var(--color-mx-text);
          font-weight: 700;
        }

        .blog-html-content em {
          font-style: italic;
        }

        /* Links */
        .blog-html-content a {
          color: var(--color-mx-orange);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .blog-html-content a:hover {
          color: var(--color-mx-blue);
          text-decoration: underline;
        }

        /* Blockquotes */
        .blog-html-content blockquote {
          border-left: 4px solid var(--color-mx-orange);
          padding-left: 1.5rem;
          margin: 2rem 0;
          color: var(--color-mx-text-muted);
          font-style: italic;
        }

        /* Code */
        .blog-html-content code {
          background-color: var(--color-mx-card);
          color: var(--color-mx-orange);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
          border: 1px solid var(--color-mx-border);
        }

        .blog-html-content pre {
          background-color: var(--color-mx-card);
          border: 1px solid var(--color-mx-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .blog-html-content pre code {
          background-color: transparent;
          padding: 0;
          color: var(--color-mx-text);
          border: none;
        }

        /* Images */
        .blog-html-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
        }

        /* Tables - wrap in scrollable container */
        .blog-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          display: block;
          overflow-x: auto;
        }

        .blog-html-content th,
        .blog-html-content td {
          border: 1px solid var(--color-mx-border);
          padding: 0.75rem;
          text-align: left;
        }

        .blog-html-content th {
          background-color: var(--color-mx-card);
          color: var(--color-mx-text);
          font-weight: 700;
        }

        /* Horizontal Rule */
        .blog-html-content hr {
          border: none;
          border-top: 1px solid var(--color-mx-border);
          margin: 3rem 0;
        }

        /* First paragraph after heading */
        .blog-html-content h1 + p,
        .blog-html-content h2 + p,
        .blog-html-content h3 + p {
          margin-top: 0.5rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .blog-html-content {
            font-size: 1rem;
            line-height: 1.625rem;
          }
          .blog-html-content h1 {
            font-size: 1.75rem;
          }
          .blog-html-content h2 {
            font-size: 1.5rem;
          }
          .blog-html-content h3 {
            font-size: 1.125rem;
          }
          .blog-html-content h4 {
            font-size: 1.05rem;
          }
        }
      `}</style>
      <section id="blog-content-section" className="py-16 md:py-24 px-6 md:px-12 bg-mx-bg">
        <div className="max-w-7xl mx-auto">
          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mb-12 max-w-4xl"
          >
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-4 py-2 bg-mx-card border border-mx-border text-sm text-mx-text-muted rounded-full hover:border-mx-orange/50 hover:text-mx-orange transition-colors"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <div className="flex items-start gap-12 justify-between">
            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl flex-1 min-w-0"
            >
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="blog-html-content overflow-x-hidden"
              />
            </motion.article>

            {/* Table of Contents */}
            <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-28">
              <BlogTableOfContents contentHtml={post.content} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};
