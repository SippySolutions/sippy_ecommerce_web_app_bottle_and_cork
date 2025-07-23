import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { fetchCategories } from "../services/api";
import InlineLoader from "./InlineLoader";

function Categories() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetchCategories(); // Fetch from categories collection
        
        if (response && Array.isArray(response)) {
          // Filter only departments (level 0) and sort by sortOrder
          const departmentsList = response
            .filter(item => item.level === 0) // Only level 0 (departments)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // Sort by sortOrder
            .map(dept => ({
              _id: dept._id,
              name: dept.name,
              image: dept.image,
              description: dept.description,
              sortOrder: dept.sortOrder,
              subcategoriesCount: dept.subcategories ? dept.subcategories.length : 0
            }));
          setDepartments(departmentsList);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message || "Failed to fetch departments");
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  if (loading) {
    return (
      <section className="bg-[var(--color-muted)] py-6">
        <div className="container mx-auto px-2 text-center">
          <div className="py-8">
            <InlineLoader 
              text="Loading categories..." 
              size="sm"
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <section className="bg-[var(--color-muted)] py-6">
      <div className="container mx-auto px-2 text-center">
        <div className="mb-4">
         
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            EXPLORE OUR <span className="text-black">DEPARTMENTS</span>
          </h2>
        </div>

        {/* Departments Section */}
        <div className="grid grid-cols-6 sm:grid-cols-7 md:flex md:overflow-x-auto gap-1 sm:gap-3 md:gap-6 md:justify-center mt-4 pb-2 hide-scrollbar">
          {departments.map((department) => (
            <div
              key={department._id}
              className="flex flex-col items-center text-center group cursor-pointer min-w-0 md:min-w-[120px] p-1 sm:p-2 md:p-3 hover:bg-white/50 rounded-lg transition-all"
              onClick={() => navigate(`/products?department=${department.name}`)}
            >
              {/* Department Image or Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[var(--color-background)] rounded-full flex items-center justify-center mb-1 sm:mb-2 md:mb-3 transition-transform transform group-hover:scale-110 shadow-lg overflow-hidden">
                {department.image ? (
                  <img
                    src={department.image}
                    alt={department.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-white">
                    {department.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-sm font-medium text-[var(--color-primary)] group-hover:text-[var(--color-accent)] truncate w-full leading-tight">
                {department.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hide scrollbar utility */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </section>
  );
}

export default Categories;
