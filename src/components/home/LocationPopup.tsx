import { useState, useEffect } from "react";
import { useCurrency } from "@/hooks/useCurrency";

interface LocationFormProps {
  onClose: () => void;
  isPopover?: boolean;
}

export const LocationForm = ({ onClose, isPopover = false }: LocationFormProps) => {
  const { countryCode, setCountry, zipCode: globalZip, setZipCode: setGlobalZip } = useCurrency();

  // Local state for the form
  const [selectedCountryName, setSelectedCountryName] = useState("United States");
  const [localZipCode, setLocalZipCode] = useState("");

  const countries = [
    { name: "United States", code: "US", flag: "🇺🇸" },
    { name: "Canada", code: "CA", flag: "🇨🇦" },
    { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
    { name: "Germany", code: "DE", flag: "🇩🇪" },
    { name: "India", code: "IN", flag: "🇮🇳" },
    { name: "China", code: "CN", flag: "🇨🇳" },
    { name: "Australia", code: "AU", flag: "🇦🇺" },
    { name: "Japan", code: "JP", flag: "🇯🇵" },
  ];

  // Sync local state with global state when mounted
  useEffect(() => {
    const currentCountry = countries.find(c => c.code === countryCode);
    if (currentCountry) {
      setSelectedCountryName(currentCountry.name);
    }
    setLocalZipCode(globalZip);
  }, [countryCode, globalZip]);

  const handleSave = () => {
    const country = countries.find(c => c.name === selectedCountryName);
    if (country) {
      setCountry(country.code);
      setGlobalZip(localZipCode);
    }
    onClose();
  };

  return (
    <div className={`location-form-content ${isPopover ? 'p-0 shadow-none' : ''}`}>
      <div className="modal-header">
        <h2 className={isPopover ? "text-lg" : ""}>Specify your location</h2>
        {!isPopover && (
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>
        )}
      </div>

      <p className="subtitle">
        Shipping options and fees vary based on your location
      </p>

      {!isPopover && <button className="primary-btn mb-4">Add address</button>}

      {!isPopover && (
        <div className="divider">
          <span>Or</span>
        </div>
      )}

      <div className="field">
        <div className="select-wrapper">
          <span className="flag">
            {countries.find((c) => c.name === selectedCountryName)?.flag || "🌍"}
          </span>
          <select
            value={selectedCountryName}
            onChange={(e) => setSelectedCountryName(e.target.value)}
          >
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <input
          type="text"
          placeholder='ZIP code "10011" or "10011-0043"'
          value={localZipCode}
          onChange={(e) => setLocalZipCode(e.target.value)}
        />
      </div>

      <button className="primary-btn" onClick={handleSave}>
        Save
      </button>

      <style>{`
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #222;
        }

        .close-btn {
          font-size: 28px;
          cursor: pointer;
          color: #666;
          line-height: 1;
          transition: color 0.2s ease;
          font-weight: 300;
        }

        .close-btn:hover {
          color: #222;
        }

        .subtitle {
          font-size: 14px;
          color: #666;
          margin: 0 0 20px;
          line-height: 1.5;
        }

        .primary-btn {
          width: 100%;
          background: #ff6a00;
          color: #fff;
          border: none;
          border-radius: 24px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .primary-btn:hover {
          background: #ff7518;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 106, 0, 0.3);
        }

        .primary-btn:active {
          transform: translateY(0);
        }

        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: "";
          height: 1px;
          background: #e0e0e0;
          width: 43%;
          position: absolute;
          top: 50%;
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .divider span {
          background: #fff;
          padding: 0 12px;
          font-size: 13px;
          color: #999;
          position: relative;
        }

        .field {
          margin-bottom: 16px;
        }

        .select-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          padding: 0 14px;
          background: #fff;
          transition: border-color 0.2s ease;
        }

        .select-wrapper:focus-within {
          border-color: #ff6a00;
          box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.1);
        }

        .select-wrapper .flag {
          font-size: 22px;
          margin-right: 10px;
          line-height: 1;
        }

        .select-wrapper select {
          flex: 1;
          border: none;
          padding: 14px 0;
          font-size: 14px;
          background: transparent;
          outline: none;
          cursor: pointer;
          color: #333;
          font-family: inherit;
        }

        .field input {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .field input:focus {
          border-color: #ff6a00;
          box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.1);
        }

        .field input::placeholder {
          color: #999;
        }
      `}</style>
    </div>
  );
};

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationPopup = ({ isOpen, onClose }: LocationPopupProps) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-overlay" onClick={handleOverlayClick}>
      <div className="location-modal">
        <LocationForm onClose={onClose} />
      </div>

      <style>{`
        .location-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .location-modal {
          width: 400px;
          max-width: 90%;
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .location-overlay {
            align-items: flex-end;
          }

          .location-modal {
            width: 100%;
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
};

export default LocationPopup;
