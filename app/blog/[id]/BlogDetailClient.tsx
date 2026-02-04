'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { BlogHeroSection } from '../../components/BlogHeroSection';
import { BlogContent } from '../../components/BlogContent';
import { BlogAuthor } from '../../components/BlogAuthor';
import { BlogRelatedClient } from '../../components/BlogRelatedClient';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogDetailClientProps {
  post: BlogPost | null;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!post) {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
        <FontStyles />

        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Artículo no encontrado
            </h2>
            <p className="text-neutral-400 mb-8 font-light">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-base font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
            >
              Ver todos los artículos
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-clip">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <BlogHeroSection post={post} />
        <BlogContent post={post} />
        <BlogAuthor post={post} />
        <BlogRelatedClient posts={relatedPosts} />
      </main>

      <Footer />
    </div>
  );
}
