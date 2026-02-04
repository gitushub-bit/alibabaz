import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

export const RFQBanner = () => {
  const navigate = useNavigate();
  const { content } = useSiteContent();

  if (!content.rfqBanner?.enabled) return null;

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {/* Background with Gradient and Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a00] to-[#ff4500]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_white_0%,_transparent_50%)]"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          </div>

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Content Side */}
            <div className="flex items-start gap-6 max-w-2xl">
              <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <FileText className="w-8 h-8 text-white drop-shadow-sm" />
              </div>

              <div className="text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  {content.rfqBanner?.title || "Request for Quotation"}
                </h3>
                <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                  {content.rfqBanner?.description || "One request, multiple quotes. customized matches for your business needs."}
                </p>
              </div>
            </div>

            {/* Action Side */}
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-[#ff6a00] hover:bg-gray-50 border-0 font-bold px-8 h-12 text-base shadow-lg transition-transform hover:scale-105"
                onClick={() => navigate("/products")}
              >
                Post Your Request <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <button
                className="text-white/90 font-medium hover:text-white underline decoration-white/50 hover:decoration-white transition-all text-sm sm:text-base whitespace-nowrap"
                onClick={() => navigate("/buyer/rfqs")}
              >
                Learn how it works
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
