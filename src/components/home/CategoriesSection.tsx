import { useState } from "react";

const CategoriesSection = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const sidebarCategories = [
    "Categories for you",
    "Apparel & Accessories",
    "Consumer Electronics",
    "Sports & Entertainment",
    "Beauty",
    "Luggage, Bags & Cases",
    "Home & Garden",
    "Sportswear & Outdoor",
    "Jewelry, Eyewear & Watches",
    "Shoes & Accessories",
    "Packaging & Printing",
    "Parents, Kids & Toys",
    "Personal Care & Home Care",
    "Health & Medical",
    "Gifts & Crafts",
  ];

  const mainCategories = [
    { icon: "🚗", name: "Electric Cars" },
    { icon: "🏍️", name: "Electric Motorcycles" },
    { icon: "💻", name: "Laptops" },
    { icon: "🚁", name: "Drones" },
    { icon: "⌚", name: "Smart Watches" },
    { icon: "👰", name: "Wedding Dresses" },
    { icon: "🛴", name: "Electric Scooters" },
    { icon: "🚙", name: "Used Cars" },
    { icon: "🚘", name: "Cars" },
    { icon: "🏍️", name: "Motorcycle" },
    { icon: "🔧", name: "Car Accessories" },
    { icon: "👗", name: "Women's Sets" },
    { icon: "👠", name: "Evening Dresses" },
    { icon: "🛏️", name: "Bedroom Furniture" },
  ];

  const apparelCategories = [
    { icon: "🎖️", name: "Camouflage" },
    { icon: "🎭", name: "Carnival Costume" },
    { icon: "🏒", name: "Ice Hockey" },
    { icon: "🦺", name: "Hunting Vest" },
    { icon: "🧵", name: "Garment Accessories" },
    { icon: "✂️", name: "Trimmings" },
    { icon: "👔", name: "Polyester Ties" },
  ];

  const electronicsCategories = [
    { icon: "📱", name: "Smartphones" },
    { icon: "🎧", name: "Headphones" },
    { icon: "📷", name: "Cameras" },
    { icon: "🖥️", name: "Monitors" },
    { icon: "⌨️", name: "Keyboards" },
    { icon: "🖱️", name: "Gaming Mouse" },
    { icon: "🔋", name: "Power Banks" },
  ];

  const homeGardenCategories = [
    { icon: "🪴", name: "Indoor Plants" },
    { icon: "🕯️", name: "Candles" },
    { icon: "🖼️", name: "Wall Art" },
    { icon: "🛋️", name: "Sofas" },
    { icon: "💡", name: "LED Lights" },
    { icon: "🧺", name: "Storage Baskets" },
    { icon: "🪞", name: "Mirrors" },
  ];

  return (
    <section className="categories-wrapper">
      {/* LEFT SIDEBAR */}
      <div className="categories-left">
        {sidebarCategories.map((category, index) => (
          <div
            key={index}
            className={`category-item ${activeCategory === index ? "active" : ""}`}
            onClick={() => setActiveCategory(index)}
          >
            <div className="category-icon"></div>
            <div className="category-title">{category}</div>
          </div>
        ))}
      </div>

      {/* RIGHT CONTENT */}
      <div className="categories-right">
        <div className="section-title">Categories for you</div>

        <div className="category-grid">
          {mainCategories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-image">{category.icon}</div>
              <div className="category-name">{category.name}</div>
            </div>
          ))}
        </div>

        {/* SUBSECTION 1 */}
        <div className="subsection">
          <div className="subsection-header">
            <div className="section-title">Apparel & Accessories</div>
            <a href="#">Browse featured selections →</a>
          </div>

          <div className="category-grid">
            {apparelCategories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-image">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBSECTION 2 */}
        <div className="subsection">
          <div className="subsection-header">
            <div className="section-title">Consumer Electronics</div>
            <a href="#">Browse featured selections →</a>
          </div>

          <div className="category-grid">
            {electronicsCategories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-image">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBSECTION 3 */}
        <div className="subsection">
          <div className="subsection-header">
            <div className="section-title">Home & Garden</div>
            <a href="#">Browse featured selections →</a>
          </div>

          <div className="category-grid">
            {homeGardenCategories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-image">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .categories-wrapper {
          display: flex;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #e5e5e5;
          overflow: hidden;
          margin: 24px auto;
          max-width: 1440px;
        }

        .categories-left {
          width: 260px;
          border-right: 1px solid #e5e5e5;
          background: #fafafa;
          max-height: 600px;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .categories-left::-webkit-scrollbar {
          width: 6px;
        }

        .categories-left::-webkit-scrollbar-track {
          background: transparent;
        }

        .categories-left::-webkit-scrollbar-thumb {
          background: #d0d0d0;
          border-radius: 3px;
        }

        .categories-left::-webkit-scrollbar-thumb:hover {
          background: #b0b0b0;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .category-item:hover {
          background: #fff;
          color: #FF6A00;
        }

        .category-item.active {
          background: #fff;
          border-left-color: #FF6A00;
          font-weight: 600;
          color: #FF6A00;
        }

        .category-icon {
          width: 24px;
          height: 24px;
          background: #f5f5f5;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .category-title {
          font-size: 13px;
          color: inherit;
          line-height: 1.4;
        }

        .categories-right {
          flex: 1;
          padding: 32px 40px;
          overflow-y: auto;
          max-height: 600px;
        }

        .categories-right::-webkit-scrollbar {
          width: 6px;
        }

        .categories-right::-webkit-scrollbar-track {
          background: transparent;
        }

        .categories-right::-webkit-scrollbar-thumb {
          background: #d0d0d0;
          border-radius: 3px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #222;
          margin-bottom: 24px;
          line-height: 1.3;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 20px 16px;
          margin-bottom: 48px;
        }

        .category-card {
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .category-card:hover .category-name {
          color: #FF6A00;
          text-decoration: underline;
        }

        .category-image {
          width: 80px;
          height: 80px;
          margin: 0 auto 10px;
          background: #f9f9f9;
          border-radius: 50%;
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .category-name {
          font-size: 13px;
          color: #555;
          line-height: 1.4;
          font-weight: 400;
        }

        .subsection {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #eee;
        }

        .subsection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .subsection-header a {
          font-size: 13px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .subsection-header a:hover {
          color: #FF6A00;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .category-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(5, 1fr);
          }
          
          .categories-left {
            width: 220px;
          }
        }

        @media (max-width: 768px) {
          .categories-wrapper {
            flex-direction: column;
            border: none;
            background: transparent;
          }
          
          .categories-left {
            width: 100%;
            max-height: auto;
            border-right: none;
            border-bottom: 1px solid #e5e5e5;
            display: none; /* Hide sidebar on mobile */
          }
          
          .category-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .categories-right {
            padding: 16px 0;
            background: transparent;
          }
        }

        @media (max-width: 480px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px 12px;
          }
          
          .category-image {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }
          
          .category-name {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;
