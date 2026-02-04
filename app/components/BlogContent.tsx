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
          color: rgb(212, 212, 212);
          font-size: 1.125rem;
          line-height: 1.75rem;
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
          color: rgb(255, 255, 255);
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .blog-html-content h2 {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: rgb(255, 255, 255);
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }

        .blog-html-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.3;
          color: rgb(255, 255, 255);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-html-content h4 {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.4;
          color: rgb(255, 255, 255);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        /* Paragraphs */
        .blog-html-content p {
          color: rgb(212, 212, 212);
          font-weight: 300;
          line-height: 1.75;
          margin-bottom: 1.5rem;
        }

        /* Lists */
        .blog-html-content ul,
        .blog-html-content ol {
          color: rgb(212, 212, 212);
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
          color: rgb(255, 255, 255);
          font-weight: 700;
        }

        .blog-html-content em {
          font-style: italic;
          color: rgb(229, 229, 229);
        }

        /* Links */
        .blog-html-content a {
          color: rgb(245, 158, 11);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .blog-html-content a:hover {
          color: rgb(251, 191, 36);
          text-decoration: underline;
        }

        /* Blockquotes */
        .blog-html-content blockquote {
          border-left: 4px solid rgb(245, 158, 11);
          padding-left: 1.5rem;
          margin: 2rem 0;
          color: rgb(163, 163, 163);
          font-style: italic;
        }

        /* Code */
        .blog-html-content code {
          background-color: rgb(17, 17, 17);
          color: rgb(245, 158, 11);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }

        .blog-html-content pre {
          background-color: rgb(17, 17, 17);
          border: 1px solid rgb(38, 38, 38);
          border-radius: 0.5rem;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .blog-html-content pre code {
          background-color: transparent;
          padding: 0;
          color: rgb(212, 212, 212);
        }

        /* Images */
        .blog-html-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }

        /* Tables */
        .blog-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }

        .blog-html-content th,
        .blog-html-content td {
          border: 1px solid rgb(38, 38, 38);
          padding: 0.75rem;
          text-align: left;
        }

        .blog-html-content th {
          background-color: rgb(17, 17, 17);
          color: rgb(255, 255, 255);
          font-weight: 700;
        }

        /* Horizontal Rule */
        .blog-html-content hr {
          border: none;
          border-top: 1px solid rgb(38, 38, 38);
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
          .blog-html-content h1 {
            font-size: 2rem;
          }
          .blog-html-content h2 {
            font-size: 1.75rem;
          }
          .blog-html-content h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
      <section id="blog-content-section" className="py-24 md:py-32 px-6 md:px-12 bg-[#0a0a0a]">
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
                className="px-4 py-2 bg-white/5 border border-white/10 text-sm text-neutral-400 hover:border-amber-500/50 hover:text-amber-500 transition-colors"
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
                className="blog-html-content"
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
