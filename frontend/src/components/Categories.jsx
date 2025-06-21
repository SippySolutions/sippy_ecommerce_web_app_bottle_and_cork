import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { fetchDepartments } from "../services/api";
import InlineLoader from "./InlineLoader";

function Categories() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Get search params to check for department
  
  // Get current department from URL
  const selectedDepartment = searchParams.get('department');
  
  // Get categories for the selected department
  const getSelectedDepartmentCategories = () => {
    if (!selectedDepartment) return [];
    const dept = departments.find(d => d.department === selectedDepartment);
    return dept?.categories || [];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchDepartments(); // Fetch departments from the API
        setDepartments(data.departments); // Assuming the API returns an object with a `departments` array
      } catch (err) {
        setError(err.message || "Failed to fetch departments");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);  if (loading) {
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
  }  return (
    <section className="bg-[var(--color-muted)] py-6">
      <div className="container mx-auto px-2 text-center">
        {/* Show department hero title if department is selected */}
        {selectedDepartment && (
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Explore Our <span className="text-black">Categories</span>
            </h2>
          </div>
        )}

        {/* Show categories if department is selected, otherwise show departments */}
        {selectedDepartment ? (
          // Categories Section
          <div>
            <h3 className="text-xs text-gray-500 uppercase mb-2">Categories in {selectedDepartment}</h3>
            <div className="flex overflow-x-auto gap-2 justify-center sm:gap-4 mt-4 pb-2 hide-scrollbar max-h-32 overflow-y-auto">
              {getSelectedDepartmentCategories().map((categoryData, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center group cursor-pointer min-w-[80px] sm:min-w-[100px] p-2 hover:bg-white/50 rounded-lg transition-all"
                  onClick={() => navigate(`/products?department=${selectedDepartment}&category=${categoryData.category}`)}
                >
                  {/* Category Name */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-background)] rounded-full flex items-center justify-center mb-2 transition-transform transform group-hover:scale-110 shadow-md">
                    <span className="text-lg font-bold text-white">
                      {categoryData.category?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-primary)] group-hover:text-[var(--color-accent)] truncate w-full">
                    {categoryData.category}
                  </span>
                </div>
              ))}
            </div>
           
            {/* Back to all departments button - only show when department is selected */}
            <button
              onClick={() => navigate('/products')}
              className="mt-4 text-sm text-[var(--color-accent)] hover:underline font-medium"
            >
              ← Back to All Departments
            </button>
          </div>
        ) : (
          // Departments Section (default)
          <div>
            <h3 className="text-xs text-gray-500 uppercase mb-1">Departments</h3>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Explore Our <span className="text-black">Departments</span>
            </h2>
            <div className="flex overflow-x-auto gap-2 justify-center sm:gap-4 mt-4 pb-2 hide-scrollbar">
              {departments.map((department, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center group cursor-pointer min-w-[60px] sm:min-w-[80px]"
                  onClick={() => navigate(`/products?department=${department.department}`)}
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[var(--color-background)] rounded-full flex items-center justify-center mb-1 transition-transform transform group-hover:scale-110">
                    <img
                      src={`https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/departments/${department.department.toLowerCase()}.png`}
                      alt={department.department}
                      className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary)] truncate w-full">
                    {department.department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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