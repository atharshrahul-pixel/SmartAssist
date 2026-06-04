import React from 'react';

/**
 * Safely parses and renders translation strings containing <span class="accent-word">...</span> tags
 * to avoid dangerouslySetInnerHTML and prevent XSS.
 * 
 * @param {string} text - The translation string
 * @returns {React.ReactNode} Safely parsed React elements
 */
export const renderSafeTitle = (text) => {
  if (!text) return '';
  const match = text.match(/^(.*)<span class="accent-word">(.*)<\/span>(.*)$/);
  if (match) {
    return (
      <React.Fragment>
        {match[1]}<span className="accent-word">{match[2]}</span>{match[3]}
      </React.Fragment>
    );
  }
  return text;
};
