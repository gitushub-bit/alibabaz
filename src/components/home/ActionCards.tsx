import { Grid3X3, Target, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";

export const ActionCards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const { countryCode, getCountryFlag } = useCurrency();

  const actions = [
    {
      icon: Grid3X3,
      label: t("home.sourceByCategory"),
      color: "bg-primary/10 text-primary",
      path: "/products",
    },
    {
      icon: Target,
      label: t("home.requestQuotation"),
      color: "bg-destructive/10 text-destructive",
      path: "/buyer/rfq/new",
    },
    {
      icon: Globe,
      label: countryCode || "Europe",
      badge: "Open",
      color: "bg-accent text-accent-foreground",
      path: `/products?region=${countryCode?.toLowerCase() || 'europe'}`,
      flag: getCountryFlag(countryCode),
    },
  ];

  if (!content.actionCards?.enabled) return null;

  return (
    <div className="px-4 py-3 md:hidden">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="action-card shrink-0 min-w-[140px] p-3 rounded-xl bg-card border border-border hover:shadow-md transition-shadow flex gap-3 items-start"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
              {action.flag ? (
                <span className="text-xl">{action.flag}</span>
              ) : (
                <action.icon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {action.label}
              </p>
              {action.badge && (
                <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  {action.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
