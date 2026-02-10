'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin } from 'lucide-react';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogAuthorProps {
  post: BlogPost;
}

export const BlogAuthor: React.FC<BlogAuthorProps> = ({ post }) => {
  if (!post.author.name) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 bg-mx-bg border-y border-mx-border">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-mx-card border border-mx-border rounded-2xl"
        >
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-24 h-24 rounded-full border-2 border-mx-orange/30 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-mx-orange/10 border-2 border-mx-orange/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-mx-orange">
                {getInitials(post.author.name)}
              </span>
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-mx-text mb-2">{post.author.name}</h3>
            {post.author.role && (
              <p className="text-mx-orange mb-4 font-medium">{post.author.role}</p>
            )}
            {post.author.roleDescription && (
              <p className="text-mx-text-muted font-light mb-4">
                {post.author.roleDescription}
              </p>
            )}
            {(post.author.email || post.author.linkedin) && (
              <div className="flex items-center justify-center md:justify-start gap-4">
                {post.author.email && (
                  <a
                    href={`mailto:${post.author.email}`}
                    className="flex items-center gap-2 text-mx-text-muted hover:text-mx-orange transition-colors"
                    title={post.author.email}
                  >
                    <Mail size={18} />
                    <span className="text-sm">{post.author.email}</span>
                  </a>
                )}
                {post.author.linkedin && (
                  <a
                    href={post.author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-mx-text-muted hover:text-mx-orange transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin size={18} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
