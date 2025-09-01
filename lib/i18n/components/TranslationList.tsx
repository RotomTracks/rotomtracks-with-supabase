/**
 * Component for rendering translation arrays as lists
 */

import React from 'react';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface TranslationListProps {
  translationKey: string;
  className?: string;
  itemClassName?: string;
  as?: 'ul' | 'ol' | 'div';
  renderItem?: (item: string, index: number) => React.ReactNode;
}

/**
 * Component that renders translation arrays as formatted lists
 */
export function TranslationList({
  translationKey,
  className,
  itemClassName,
  as: Component = 'ul',
  renderItem,
}: TranslationListProps) {
  const { tCommon } = useTypedTranslation();
  
  // Note: This component may need to be updated based on specific translation needs
  const translation = tCommon('common.loading'); // Placeholder - needs specific implementation
  const items = Array.isArray(translation) ? translation : [String(translation)];

  const defaultRenderItem = (item: string, index: number) => (
    <li key={index} className={itemClassName}>
      {item}
    </li>
  );

  const itemRenderer = renderItem || defaultRenderItem;

  if (Component === 'div') {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={index} className={itemClassName}>
            {typeof renderItem === 'function' ? renderItem(item, index) : item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Component className={className}>
      {items.map(itemRenderer)}
    </Component>
  );
}