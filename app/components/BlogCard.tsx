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
      whileHover={{ y: -5 }}
      className="group relative bg-[#0a0a0a] border border-white/10 rounded-none overflow-hidden hover:border-amber-500/50 transition-colors duration-500 flex flex-col"
    >
      {/* Featured Image with hero-style effects */}
      <div className="relative h-64 overflow-hidden bg-neutral-900">
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 80% at center, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)",
          }}
        />
        {/* Image with noise and tint */}
        <div className="noise w-full h-full relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
          />
          {/* Amber tint overlay */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: '#000' }}
          />
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: '#ff9b06', opacity: 0.5 }}
          />
        </div>
        {post.featured && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest">
            <Award size={12} /> Destacado
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest">
          {post.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-10 flex flex-col flex-grow">
        {/* Metadata */}
        <div className="flex items-center gap-4 mb-6 text-neutral-500 text-xs">
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={14} />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-amber-500 transition-colors duration-300 leading-tight">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-neutral-400 font-light mb-6 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.author.name && (
              <>
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-500">
                      {getInitials(post.author.name)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    {post.author.name}
                  </p>
                  {post.author.role && (
                    <p className="text-xs text-neutral-500">
                      {post.author.role}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500"
          >
            <ArrowUpRight
              size={16}
              className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Hover Overlay Action - Bottom Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left" />
    </motion.article>
  );
};
