
interface MenuItem {
  id: string;
  dish_name: string;
  description: string;
  price: string;
  dish_type: string;
  ingredients: string[];
  restaurant_id?: string;
}

// Define the menu category order for smart sorting
const CATEGORY_ORDER = [
  'Appetizers',
  'Soups & Salads',
  'Pizza',
  'Sandwiches & Wraps',
  'Sushi & Asian',
  'Main Courses',
  'Sides',
  'Desserts',
  'Beverages'
];

const getCategoryOrder = (dishType: string): number => {
  const index = CATEGORY_ORDER.indexOf(dishType);
  return index === -1 ? 999 : index; // Put unknown categories at the end
};

export const categorizeDish = (dishType: string, dishName: string): string => {
  const lowerType = dishType?.toLowerCase() || '';
  const lowerName = dishName?.toLowerCase() || '';
  
  // Appetizers
  if (lowerType.includes('appetizer') || lowerType.includes('starter') || lowerType.includes('small plate')) {
    return 'Appetizers';
  }
  
  // Soups & Salads
  if (lowerType.includes('soup') || lowerType.includes('salad')) {
    return 'Soups & Salads';
  }
  
  // Pizza
  if (lowerType.includes('pizza') || lowerName.includes('pizza')) {
    return 'Pizza';
  }
  
  // Sandwiches & Wraps
  if (lowerType.includes('sandwich') || lowerType.includes('wrap') || lowerType.includes('burger') ||
      lowerName.includes('sandwich') || lowerName.includes('wrap') || lowerName.includes('burger')) {
    return 'Sandwiches & Wraps';
  }
  
  // Sushi & Asian
  if (lowerType.includes('sushi') || lowerType.includes('asian') || lowerType.includes('roll') ||
      lowerName.includes('sushi') || lowerName.includes('roll') || lowerName.includes('maki') ||
      lowerName.includes('tempura') || lowerName.includes('teriyaki')) {
    return 'Sushi & Asian';
  }
  
  // Sides
  if (lowerType.includes('side') || lowerType.includes('vegetable')) {
    return 'Sides';
  }
  
  // Desserts
  if (lowerType.includes('dessert') || lowerType.includes('sweet') || lowerType.includes('cake') || 
      lowerType.includes('ice cream') || lowerName.includes('cake') || lowerName.includes('ice cream')) {
    return 'Desserts';
  }
  
  // Beverages
  if (lowerType.includes('beverage') || lowerType.includes('drink') || lowerType.includes('coffee') || lowerType.includes('tea')) {
    return 'Beverages';
  }
  
  // Default to Main Courses
  return 'Main Courses';
};

export const sortMenuItems = (items: MenuItem[]): MenuItem[] => {
  return [...items].sort((a, b) => {
    // Categorize items based on both dish_type and dish_name
    const categoryA = categorizeDish(a.dish_type, a.dish_name);
    const categoryB = categorizeDish(b.dish_type, b.dish_name);
    
    // First sort by category order
    const categoryOrderA = getCategoryOrder(categoryA);
    const categoryOrderB = getCategoryOrder(categoryB);
    
    if (categoryOrderA !== categoryOrderB) {
      return categoryOrderA - categoryOrderB;
    }
    
    // Within the same category, sort alphabetically by dish name
    return a.dish_name.localeCompare(b.dish_name);
  });
};
