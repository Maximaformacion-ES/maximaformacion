'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, ArrowUpRight } from 'lucide-react';

export interface Course {
  title: string;
  description: string;
  category: string;
  image: string;
  rating: number;
  students: string;
  price: number;
  originalPrice: number;
}

interface CourseCardProps {
  course: Course;
  index: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#111] rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <motion.img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-medium rounded-full">
            {course.category}
          </span>
        </div>
        
        {/* Play button for video preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <Play size={24} className="text-white ml-1" fill="white" />
          </div>
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < Math.floor(course.rating) ? "text-amber-400" : "text-white/20"} 
                fill={i < Math.floor(course.rating) ? "#f59e0b" : "transparent"}
              />
            ))}
          </div>
          <span className="text-white/50 text-sm">{course.rating}</span>
          <span className="text-white/30 text-sm">({course.students} estudiantes)</span>
        </div>
        
        <h3 className="text-white text-xl font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-white/50 text-sm font-light mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <span className="text-white/40 text-sm line-through mr-2">{course.originalPrice}€</span>
            <span className="text-white text-xl font-bold">{course.price}€</span>
          </div>
          
          <motion.div
            animate={{ x: isHovered ? 4 : 0 }}
            className="text-amber-400"
          >
            <ArrowUpRight size={20} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
