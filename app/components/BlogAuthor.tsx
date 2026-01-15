'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '../data/blogs';

interface BlogAuthorProps {
  post: BlogPost;
}

export const BlogAuthor: React.FC<BlogAuthorProps> = ({ post }) => {
  return (
    <section className="py-16 px-6 md:px-12 bg-neutral-950 border-y border-white/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-black/40 border border-white/10"
        >
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-24 h-24 rounded-full border-2 border-amber-500/50"
          />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">{post.author.name}</h3>
            <p className="text-amber-500 mb-4">{post.author.role}</p>
            <p className="text-neutral-400 font-light">
              Experto en análisis estadístico y ciencia de datos con más de 10 años de experiencia 
              liderando proyectos en empresas e instituciones.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
