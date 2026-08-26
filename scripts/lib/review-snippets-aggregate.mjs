/**
 * Derives aggregate rating from the visible review cards (real + fictional).
 * Keeps JSON-LD, UI, and OG in sync with on-page content for GSC review snippets.
 */
export function computeReviewAggregate(reviews, bestRating = 5) {
  if (!reviews?.length) {
    return { reviewCount: 0, ratingValue: 0, bestRating };
  }

  const reviewCount = reviews.length;
  const sum = reviews.reduce((total, review) => total + Number(review.rating), 0);
  const ratingValue = Math.round((sum / reviewCount) * 100) / 100;

  return { reviewCount, ratingValue, bestRating };
}
