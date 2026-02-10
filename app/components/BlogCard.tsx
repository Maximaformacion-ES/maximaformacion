"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, ArrowUpRight, Award } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/lib/strapi/types";

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-mx-bg rounded-xl overflow-hidden border border-mx-border hover:border-mx-orange/50 transition-all duration-300 flex flex-col"
    >
      {/* Featured Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {post.featured && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-mx-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            <Award size={12} /> Destacado
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-mx-blue text-white text-xs font-medium rounded-full">
          {post.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-mx-text-muted text-xs">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {post.readTime + ' minutos'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-mx-text mb-3 group-hover:text-mx-blue transition-colors duration-300 leading-tight line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-mx-text-muted text-sm font-light mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-mx-card border border-mx-border text-xs text-mx-text-muted rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-mx-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.author.name && (
              <>
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full border border-mx-border object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-mx-orange">
                      {getInitials(post.author.name)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-mx-text">
                    {post.author.name}
                  </p>
                  {post.author.role && (
                    <p className="text-xs text-mx-text-muted">
                      {post.author.role}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="w-10 h-10 rounded-full border border-mx-border flex items-center justify-center group-hover:bg-mx-orange group-hover:border-mx-orange transition-all duration-300"
          >
            <ArrowUpRight
              size={16}
              className="text-mx-text-muted group-hover:text-white transition-colors"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
