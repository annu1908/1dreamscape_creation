import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img shimmer"></div>
    <div className="skeleton-info">
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-price shimmer"></div>
    </div>
    <div className="skeleton-btn shimmer"></div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
