import React, { useState } from 'react';
import { registerUser } from '../services/api'; // Import the API function

const SignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setSuccess(false); // Reset success state

        try {
            await registerUser(formData); // Call the API function
            setSuccess(true);
            setFormData({ name: '', email: '', password: '' }); // Clear form
        } catch (err) {
            setError(err); // Display the error message
        }
    };    const handleGoogleSignup = () => {
        // Add your Google signup logic here
    };

    return (        <div className="w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--HeadingText)] text-center mb-4 sm:mb-6">Sign Up</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">Account created successfully! Please log in.</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-[var(--bodyText)]"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-[var(--muted)] rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[var(--bodyText)]"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-[var(--muted)] rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[var(--bodyText)]"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-[var(--muted)] rounded-md shadow-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[var(--color-accent)] text-white py-2 px-4 rounded-md shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-[var(--muted)]"></div>
                    <span className="mx-4 text-[var(--bodyText)]">OR</span>
                    <div className="flex-grow border-t border-[var(--muted)]"></div>
                </div>

                {/* Social Signup Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center bg-white border border-[var(--muted)] text-[var(--bodyText)] py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Sign Up with Google
                    </button>
                    <button
                        className="w-full flex items-center justify-center border border-[var(--muted)] bg-white hover:text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Sign Up with Facebook                    </button>
                </div>
            </div>
    );
};

export default SignupForm;