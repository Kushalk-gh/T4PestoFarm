import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface CategoryItem {
  name: string;
  imageUrl: string;
  slug: string;
}

const categoriesData: CategoryItem[] = [
  { name: 'Best Sellers', imageUrl: '/images/New Arrivals.png', slug: 'best-sellers' },
  { name: 'Insecticides', imageUrl: '/images/Insecticides.png', slug: 'insecticides' },
  { name: 'Nutrients', imageUrl: '/images/Nutrients.png', slug: 'micronutrients' },
  { name: 'Fungicides', imageUrl: '/images/Fungicides.png', slug: 'fungicides' },
  { name: 'Vegetable Seeds', imageUrl: '/images/Vegetable Seeds.png', slug: 'vegetable-seeds' },
  { name: 'Fruit Seeds', imageUrl: '/images/Fruit Seeds.png', slug: 'fruit-seeds' },
  { name: 'Flower Seeds', imageUrl: '/images/Flower Seeds.png', slug: 'flower-seeds' },
  { name: 'Herbicides', imageUrl: '/images/Herbicides.png', slug: 'herbicides' },
  { name: 'Growth Promoters', imageUrl: '/images/Growth Promoters.png', slug: 'plant-growth-regulators' },
  { name: 'Organic Farming', imageUrl: '/images/Organic Farming.png', slug: 'organic-farming' },
  // { name: 'New Arrivals', imageUrl: '/images/New Arrivals.png', slug: 'new-arrivals' },
];

const CategorySection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  return (
    <div className="bg-white w-full px-4 py-8">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-5 scale-[1.3]">Categories</h2>
      <div className="border-b-4 border-gray-800 w-[396px] sm:w-[396px] md:w-[600px] lg:w-[1430px] mx-auto mb-5"></div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-16 justify-items-center">
        {categoriesData.map((category, index) => (
          <div key={index} className="flex flex-col items-center">
            <button
              className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
              onClick={() => handleCategoryClick(category.slug)}
              aria-label={`Navigate to ${category.name} category`}
            >
              <div className={`bg-gray-100 rounded-full shadow-md border-4 border-green-500 flex items-center justify-center mb-4 w-48 h-48`}>
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <p className="text-center text-lg text-gray-700">{category.name}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
