"use client";

import React from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { Clock, Calendar, ArrowUpRight, Award } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/lib/strapi/types";
import { getCategoryStyle } from "@/lib/blog-categories";

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

  const style = getCategoryStyle(post.category);

  return (
    <m.a
      href={`/blog/${post.slug}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative bg-mx-bg rounded-xl overflow-hidden border border-mx-border ${style.hoverBorder} transition-all duration-300 flex flex-col`}
    >
      {/* Category accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accentBg} z-30`} />

      {/* Featured Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {post.featured && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-mx-orange text-white text-label-sm font-bold uppercase tracking-widest rounded-full">
            <Award size={12} /> Destacado
          </div>
        )}
        <div className={`absolute bottom-4 left-4 z-20 px-3 py-1.5 ${style.badgeBg} ${style.badgeText} text-label-sm md:text-label-md font-medium rounded-full shadow-lg`}>
          {post.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-mx-text-muted text-label-sm md:text-label-md">
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
        <h3 className={`text-body-sm md:text-body-md font-bold text-mx-text mb-3 ${style.hoverText} transition-colors duration-300 leading-tight line-clamp-2`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-mx-text-muted text-body-sm font-light mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-mx-card border border-mx-border text-label-sm md:text-label-md text-mx-text-muted rounded-full"
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
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full border border-mx-border object-cover"
                    width={32}
                    height={32}
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center">
                    <span className="text-label-sm md:text-label-md font-bold text-mx-orange">
                      {getInitials(post.author.name)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-label-sm md:text-label-md font-bold text-mx-text">
                    {post.author.name}
                  </p>
                  {post.author.role && (
                    <p className="text-label-sm md:text-label-md text-mx-text-muted">
                      {post.author.role}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </m.a>
  );
};
