type RatedReview = {
  rating: number;
};

/** Aggregate from on-page review cards — must match visible count for GSC. */
export function computeReviewAggregate(reviews: RatedReview[], bestRating = 5) {
  if (!reviews.length) {
    return { reviewCount: 0, ratingValue: 0, bestRating };
  }

  const reviewCount = reviews.length;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  const ratingValue = Math.round((sum / reviewCount) * 100) / 100;

  return { reviewCount, ratingValue, bestRating };
}
