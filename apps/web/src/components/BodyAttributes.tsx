'use client';

import { useEffect } from 'react';

type BodyAttributesProps = {
  attributes: Record<string, string>;
};

export function BodyAttributes({ attributes }: BodyAttributesProps) {
  useEffect(() => {
    const { class: className, ...rest } = attributes;

    if (className) {
      document.body.className = className;
    }

    for (const [key, value] of Object.entries(rest)) {
      if (value) {
        document.body.setAttribute(key, value);
      }
    }
  }, [attributes]);

  return null;
}
