import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchDepartments } from "../services/api"; // Import the API function

function Categories() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

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
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <section className="bg-[var(--color-muted)] py-6">
      <div className="container mx-auto px-2 text-center">
        {/* Section Header */}
        <h3 className="text-xs text-gray-500 uppercase mb-1">Departments</h3>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
          Explore Our <span className="text-black">Departments</span>
        </h2>

        {/* Departments Horizontal Scrollable Row */}
        <div className="flex overflow-x-auto gap-2 justify-center sm:gap-4 mt-4 pb-2 hide-scrollbar">
          {departments.map((department, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group cursor-pointer min-w-[60px] sm:min-w-[80px]"
              onClick={() => navigate(`/products?department=${department.department}`)} // Navigate on click
            >
              {/* Department Image */}
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[var(--color-background)] rounded-full flex items-center justify-center mb-1 transition-transform transform group-hover:scale-110">
                <img
                  src={`https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/departments/${department.department.toLowerCase()}.png`}
                  alt={department.department}
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                />
              </div>
              {/* Department Name */}
              <span className="text-xs sm:text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary)] truncate w-full">
                {department.department}
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