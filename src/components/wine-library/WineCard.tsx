import React from 'react';

interface WineCardProps {
  wine: {
    wine_name: string;
    varietal?: string;
    wine_type?: string;
    region?: string;
    price?: string;
    price_glass?: string;
    glass_price?: string;
    price_bottle?: string;
    bottle_price?: string;
    vintage?: string;
    description?: string;
    [key: string]: any;
  };
}

function extractPrices(wine: WineCardProps['wine']) {
  // Try all possible keys
  let glass = wine.price_glass || wine.glass_price || '';
  let bottle = wine.price_bottle || wine.bottle_price || '';
  // If both are missing, try to parse from price string
  if ((!glass || !bottle) && wine.price) {
    // Match $X/$Y, $X.X/$Y.Y, X/Y, X.X/Y.Y, etc.
    const match = wine.price.match(/\$?(\d+(\.\d+)?)\s*\/\s*\$?(\d+(\.\d+)?)/);
    if (match) {
      glass = glass || `$${match[1]}`;
      bottle = bottle || `$${match[3]}`;
    }
  }
  return { glass, bottle };
}

const WineCard: React.FC<{ wine: WineCardProps['wine'] }> = ({ wine }) => {
  const { glass, bottle } = extractPrices(wine);
  const hasBothPrices = glass && bottle;
  const hasGlass = glass && !bottle;
  const hasBottle = bottle && !glass;
  const hasOnlyPrice = wine.price && !glass && !bottle;

  return (
    <div className="wine-card">
      <h3>{wine.wine_name}</h3>
      <div>
        {wine.varietal && <span className="tag">{wine.varietal}</span>}
        {wine.wine_type && <span className="tag">{wine.wine_type}</span>}
        {wine.region && <span className="tag">{wine.region}</span>}
        {wine.vintage && <span className="tag">{wine.vintage}</span>}
      </div>
      <div>
        {hasBothPrices && (
          <>
            <span className="price">Glass: {glass}</span>
            <span className="price">Bottle: {bottle}</span>
          </>
        )}
        {hasGlass && (
          <span className="price">Glass: {glass}</span>
        )}
        {hasBottle && (
          <span className="price">Bottle: {bottle}</span>
        )}
        {hasOnlyPrice && (
          <span className="price">Price: {wine.price}</span>
        )}
      </div>
      {wine.description && <p>{wine.description}</p>}
    </div>
  );
};

export default WineCard;
