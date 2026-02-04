import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TickerBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      text: (
        <>
          Research smarter · Design easier · Source better — All-in-one with{" "}
          <span className="ai-badge">
            AI Mode
            <span className="fire-emoji">🔥</span>
          </span>
        </>
      ),
      buttonText: "Try it now",
      buttonLink: "/ai-mode",
    },
    {
      text: (
        <>
          Trade with confidence —{" "}
          <span className="ai-badge">
            Trade Assurance
            <span className="fire-emoji">✅</span>
          </span>{" "}
          protects your orders from payment to delivery
        </>
      ),
      buttonText: "Learn more",
      buttonLink: "#",
    },
    {
      text: (
        <>
          Ship globally with ease —{" "}
          <span className="ai-badge">
            Free Shipping
            <span className="fire-emoji">🚚</span>
          </span>{" "}
          on orders over $100
        </>
      ),
      buttonText: "Shop now",
      buttonLink: "#",
    },
    {
      text: (
        <>
          Join millions of buyers —{" "}
          <span className="ai-badge">
            Request for Quotation
            <span className="fire-emoji">💼</span>
          </span>{" "}
          from verified suppliers
        </>
      ),
      buttonText: "Get quotes",
      buttonLink: "#",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="ticker-banner">
      <div className="ticker-content" key={currentBanner}>
        <div className="ticker-text">{banners[currentBanner].text}</div>
        <button
          className="cta-button"
          onClick={() => {
            const link = banners[currentBanner].buttonLink;
            if (link.startsWith('/')) {
              navigate(link);
            } else {
              if (link !== '#') window.open(link, "_blank");
            }
          }}
        >
          {banners[currentBanner].buttonText}
          <span className="arrow">→</span>
        </button>
      </div>

      <style>{`
        .ticker-banner {
          width: 100%;
          background: #FFE8D6; /* Clone beige color */
          overflow: hidden;
          position: relative;
          height: 44px; /* Slightly taller */
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #FFD7B5;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 0 20px;
          position: relative;
          z-index: 1;
          animation: fadeIn 0.5s ease-in-out;
          width: 100%;
          max-width: 1440px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ticker-text {
          color: #111;
          font-size: 15px;
          font-weight: 400; /* Regular weight base */
          letter-spacing: -0.01em;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          font-weight: 800; /* Extra bold */
          color: #1a1a1a;
          position: relative;
        }

        .cta-button {
          background: #FF6600;
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.2s;
        }

        .cta-button:hover {
          background: #E65C00;
        }

        .arrow {
          font-family: system-ui, sans-serif;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default TickerBanner;
