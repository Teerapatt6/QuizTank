import { categories } from '@/data/mockQuizzes';
import { Category } from '@/types/quiz';

interface CategoryBarProps {
  selectedCategory?: Category;
  onSelectCategory?: (category: Category) => void;
}

const CategoryBar = ({ selectedCategory, onSelectCategory }: CategoryBarProps) => {
  return (
    <section className="py-4 md:py-8 border-b border-border/50">
      <div className="container px-4">
        <div className="flex justify-start md:justify-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory?.(category.id)}
              className={`flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl transition-all duration-200 hover:bg-secondary group shrink-0 ${
                selectedCategory === category.id ? 'bg-secondary' : ''
              }`}
            >
              <span className="text-2xl md:text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </span>
              <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;
