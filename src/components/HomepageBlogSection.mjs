import React from 'react';

import { homepageBlogPosts } from '../data/homepageBlogPosts.mjs';

export function HomepageBlogSection({ posts = homepageBlogPosts }) {
  return React.createElement(
    'section',
    {
      className: 'react-homepage-blog',
      'data-section': 'homepage-blog',
      'aria-labelledby': 'homepage-blog-title',
    },
    React.createElement('style', null, homepageBlogStyles),
    React.createElement(
      'div',
      {
        className: 'react-homepage-blog__inner',
      },
      React.createElement(
        'div',
        {
          className: 'react-homepage-blog__heading',
        },
        React.createElement(
          'p',
          {
            className: 'react-homepage-blog__eyebrow',
          },
          'Блог',
        ),
        React.createElement(
          'h2',
          {
            id: 'homepage-blog-title',
            className: 'react-homepage-blog__title',
          },
          'Статьи о покере',
        ),
      ),
      React.createElement(
        'div',
        {
          className: 'react-homepage-blog__grid',
        },
        ...posts.map((post) => React.createElement(HomePageBlogCard, {
          key: post.slug,
          post,
        })),
      ),
    ),
  );
}

function HomePageBlogCard({ post }) {
  return React.createElement(
    'article',
    {
      className: 'react-homepage-blog-card',
      'data-post-slug': post.slug,
    },
    React.createElement(
      'a',
      {
        className: 'react-homepage-blog-card__link',
        href: post.href,
      },
      React.createElement('img', {
        className: 'react-homepage-blog-card__image',
        src: post.image,
        alt: post.imageAlt,
        loading: 'lazy',
        decoding: 'async',
      }),
      React.createElement(
        'div',
        {
          className: 'react-homepage-blog-card__body',
        },
        React.createElement(
          'h3',
          {
            className: 'react-homepage-blog-card__title',
          },
          post.title,
        ),
        React.createElement(
          'p',
          {
            className: 'react-homepage-blog-card__meta',
          },
          React.createElement('time', null, post.date),
          React.createElement('span', {
            'aria-hidden': 'true',
          }, '|'),
          React.createElement('span', null, post.category),
        ),
      ),
    ),
  );
}

const homepageBlogStyles = `
.react-homepage-blog {
  background: #101622;
  color: #ffffff;
  padding: 70px 20px 90px;
}

.react-homepage-blog__inner {
  margin: 0 auto;
  max-width: 1120px;
}

.react-homepage-blog__heading {
  margin-bottom: 28px;
}

.react-homepage-blog__eyebrow {
  color: #f5d447;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin: 0 0 10px;
  text-transform: uppercase;
}

.react-homepage-blog__title {
  color: #ffffff;
  font-family: "roadradio", "Roboto", sans-serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
}

.react-homepage-blog__grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.react-homepage-blog-card {
  background: radial-gradient(at bottom center, rgba(201, 92, 92, 0.43) 0%, #131b2b 63%);
  border-radius: 30px;
  overflow: hidden;
  transition: transform 0.2s ease, background 0.2s ease;
}

.react-homepage-blog-card:hover {
  background: radial-gradient(at bottom center, rgba(69, 66, 175, 0.59) 0%, #131b2b 62%);
  transform: translateY(-2px);
}

.react-homepage-blog-card__link {
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  padding: 20px;
  text-decoration: none;
}

.react-homepage-blog-card__image {
  aspect-ratio: 1.44 / 1;
  border-radius: 30px;
  display: block;
  height: 250px;
  object-fit: cover;
  object-position: center;
  width: 100%;
}

.react-homepage-blog-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  justify-content: space-between;
}

.react-homepage-blog-card__title {
  color: #ffffff;
  font-family: "roadradio", "Roboto", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  text-transform: uppercase;
}

.react-homepage-blog-card__meta {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  gap: 10px;
  margin: 0;
}

@media (max-width: 1024px) {
  .react-homepage-blog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .react-homepage-blog-card__image {
    height: 225px;
  }

  .react-homepage-blog-card__title {
    font-size: 18px;
  }
}

@media (max-width: 767px) {
  .react-homepage-blog {
    padding: 50px 20px 70px;
  }

  .react-homepage-blog__grid {
    grid-template-columns: 1fr;
  }

  .react-homepage-blog-card__image {
    height: 200px;
  }

  .react-homepage-blog-card__title {
    font-size: 16px;
  }

  .react-homepage-blog-card__meta {
    font-size: 12px;
  }
}
`;
