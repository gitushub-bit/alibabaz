import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

export const RFQBanner = () => {
  const navigate = useNavigate();
  const { content } = useSiteContent();

  if (!content.rfqBanner?.enabled) return null;

  return (
    <section className="py-6 px-4">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white overflow-hidden shadow-lg">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
          
          {/* ICON */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>

          {/* TEXT */}
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold">
              {content.rfqBanner?.title || "Post a Buying Request"}
            </h3>
            <p className="text-sm md:text-base text-white/90 mt-2">
              {content.rfqBanner?.description || "Tell us what you need and get quotes from verified suppliers"}
            </p>
          </div>

          {/* BUTTON */}
          <div className="flex flex-col gap-2 md:items-end">
            <Button
              className="bg-white text-primary font-semibold hover:bg-white/90"
              onClick={() => navigate("/products")}
            >
              Get Quotes <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            {/* Optional link for more info */}
            <button
              className="text-sm text-white/80 hover:text-white underline"
              onClick={() => navigate("/buyer/rfq")}
            >
              Learn more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
