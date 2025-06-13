import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext"; // Import AuthContext
import Android from "../assets/android.png";
import Apple from "../assets/apple.png";
import Visa from "../assets/Visa.png";
import MasterCard from "../assets/Master.png";
import Amex from "../assets/amex.png";
import Discover from "../assets/discover.png";
import { fetchCMSData } from "../services/api"; // <-- Import from api.jsx

function Footer() {
  const [cmsData, setCmsData] = useState(null);
  const { user } = useContext(AuthContext); // Access user from AuthContext

  // Fetch CMS data using the API utility
  useEffect(() => {
    const getCMSData = async () => {
      try {
        const data = await fetchCMSData();
        setCmsData(data);
      } catch (error) {
        console.error("Error fetching CMS data:", error);
      }
    };

    getCMSData();
  }, []);

  if (!cmsData) {
    return <div>Loading...</div>;
  }

  const { storeInfo, logo } = cmsData;

  return (
    <footer className="bg-[var(--color-muted)] py-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        {!user && ( // Only show the newsletter section if the user is not logged in
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              Get exclusive offers & <span className="text-[var(--color-primary)]">rewards</span>
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              Sign up for our members to receive exclusive offers & rewards. It's easy and free!
            </p>
            <div className="mt-6 flex justify-center">
              <button className="bg-[var(--color-primary)] text-[var(--color-headingText)] px-6 py-2 rounded-md hover:bg-[var(--color-secondary)]">
                SIGN UP
              </button>
            </div>
          </div>
        )}

        {/* Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center lg:text-left">
          {/* Stay Connected */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Stay Connected</h3>
            <div className="flex justify-center lg:justify-start space-x-4 mb-4">
              <a href="#" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            <h4 className="text-sm font-bold text-[var(--color-foreground)] mb-2">We Accept</h4>
            <div className="flex justify-center lg:justify-start space-x-2">
              <img src={Visa} alt="Visa" className="h-6" />
              <img src={MasterCard} alt="MasterCard" className="h-6" />
              <img src={Amex} alt="Amex" className="h-6" />
              <img src={Discover} alt="Discover" className="h-6" />
            </div>
          </div>

          {/* Store Information */}
          <div>
            <img src={logo} alt="Store Logo" className="h-16 mx-auto lg:mx-0 mb-4" />
            <div className="text-sm text-[var(--color-muted-foreground)] font-bold">
              {storeInfo.address &&
                storeInfo.address
                  .split(',')
                  .map((line, idx) => (
                    <div key={idx}>{line.trim()}</div>
                  ))}
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              <a
                href={`tel:${storeInfo.phone?.replace(/[^+\d]/g, '')}`}
                className="hover:text-[var(--color-link)] font-bold text-[color:var(--color-accent)]"
              >
                {storeInfo.phone}
              </a>
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              <a
                href={`mailto:${storeInfo.email}`}
                className="hover:text-[var(--color-link)] font-bold text-[color:var(--color-accent)]"
              >
                {storeInfo.email}
              </a>
            </p>
          </div>

          {/* Mobile Shopping Apps */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Mobile Shopping Apps</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              Download the app and get the world at your fingertips.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <a href="#">
                <img
                  src={Android}
                  alt="App Store"
                  className="h-10"
                />
              </a>
              <a href="#">
                <img
                  src={Apple}
                  alt="Google Play"
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 text-center text-sm text-[var(--color-muted-foreground)]">
          Copyright © 2025 <span className="font-bold text-[var(--color-foreground)]">{storeInfo.name}</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;