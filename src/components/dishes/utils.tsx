
export const getDishTypeColor = (dishType: string) => {
  const colors = {
    'appetizer': 'bg-green-100 text-green-800',
    'main': 'bg-blue-100 text-blue-800',
    'dessert': 'bg-purple-100 text-purple-800',
    'side': 'bg-amber-100 text-amber-800',
    'salad': 'bg-emerald-100 text-emerald-800',
    'soup': 'bg-orange-100 text-orange-800',
  };
  return colors[dishType?.toLowerCase()] || 'bg-slate-100 text-slate-800';
};
