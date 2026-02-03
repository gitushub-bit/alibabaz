import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
interface FooterLink {
  label: string;
  href: string;
}
interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}
interface FooterSettings {
  sections: FooterSection[];
}
const defaultSettings: FooterSettings = {
  sections: [{
    id: "support",
    title: "Get support",
    links: [{
      label: "Help Center",
      href: "/help"
    }, {
      label: "Live chat",
      href: "/chat"
    }, {
      label: "Check order status",
      href: "/orders"
    }, {
      label: "Refunds",
      href: "/refunds"
    }, {
      label: "Report abuse",
      href: "/report"
    }]
  }, {
    id: "payments",
    title: "Payments and protections",
    links: [{
      label: "Safe and easy payments",
      href: "/payments"
    }, {
      label: "Money-back policy",
      href: "/refunds"
    }, {
      label: "On-time shipping",
      href: "/shipping"
    }, {
      label: "After-sales protections",
      href: "/after-sales"
    }, {
      label: "Product monitoring services",
      href: "/monitoring"
    }]
  }, {
    id: "source",
    title: "Source on Alibaba.com",
    links: [{
      label: "Request for Quotation",
      href: "/rfq"
    }, {
      label: "Membership program",
      href: "/membership"
    }, {
      label: "Sales tax and VAT",
      href: "/tax"
    }, {
      label: "Alibaba.com Reads",
      href: "/reads"
    }]
  }, {
    id: "sell",
    title: "Sell on Alibaba.com",
    links: [{
      label: "Start selling",
      href: "/sell"
    }, {
      label: "Seller Central",
      href: "/seller-central"
    }, {
      label: "Become a Verified Supplier",
      href: "/verified"
    }, {
      label: "Partnerships",
      href: "/partnerships"
    }, {
      label: "Download the app for suppliers",
      href: "/supplier-app"
    }]
  }, {
    id: "know",
    title: "Get to know us",
    links: [{
      label: "About Alibaba.com",
      href: "/about"
    }, {
      label: "Corporate responsibility",
      href: "/responsibility"
    }, {
      label: "News center",
      href: "/news"
    }, {
      label: "Careers",
      href: "/careers"
    }]
  }]
};
const ecosystemLinks = ["AliExpress", "1688.com", "Tmall Taobao World", "Alipay", "Lazada", "Taobao Global", "TAO", "Trendyol", "Europages"];
const policyLinks = ["Policies and rules", "Legal Notice", "Product Listing Policy", "Intellectual Property Protection", "Privacy Policy", "Terms of Use", "Integrity Compliance"];
const paymentIcons = ["https://s.alicdn.com/@img/imgextra/i1/O1CN01L00bAM1TmF3L42KkI_!!6000000002424-2-tps-286-80.png", "https://s.alicdn.com/@img/imgextra/i4/O1CN013pymTh1OIrZGMQ6iO_!!6000000001683-2-tps-93-80.png", "https://s.alicdn.com/@img/imgextra/i3/O1CN01CoqZOX1E5uCoNiJIr_!!6000000000301-2-tps-75-80.png", "https://s.alicdn.com/@img/imgextra/i3/O1CN01xBSIuv1ReKzDOHrTb_!!6000000002136-2-tps-214-80.png", "https://s.alicdn.com/@img/imgextra/i3/O1CN011vaDrI1VXhiEM803E_!!6000000002663-2-tps-113-112.png", "https://s.alicdn.com/@img/imgextra/i4/O1CN01dsw9V61Lbh0D1f9JG_!!6000000001318-2-tps-205-112.png", "https://s.alicdn.com/@img/imgextra/i4/O1CN01sXbha020agNJcLC4l_!!6000000006866-2-tps-148-112.png", "https://s.alicdn.com/@img/imgextra/i1/O1CN01F2dH281hwEJACdKgv_!!6000000004341-2-tps-113-112.png", "https://s.alicdn.com/@img/imgextra/i1/O1CN01pwSjDv25t4M1W8Xu8_!!6000000007583-2-tps-165-112.png", "https://s.alicdn.com/@img/imgextra/i3/O1CN01Wv6lOf1OTOfx5Dppk_!!6000000001706-2-tps-171-112.png", "https://s.alicdn.com/@img/imgextra/i4/O1CN01yLWgha1BtsZXZDDih_!!6000000000004-2-tps-158-112.png", "https://s.alicdn.com/@img/imgextra/i1/O1CN01EF6Zjm21spgURRwKI_!!6000000007041-2-tps-138-112.png"];
export const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const {
          data
        } = await supabase.from("site_settings").select("value").eq("key", "footer_settings").maybeSingle();
        if (data?.value && typeof data.value === 'object' && 'sections' in data.value) {
          setSettings(data.value as unknown as FooterSettings);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) {
    return <footer className="border-t bg-muted/50 py-12">
      <Skeleton className="h-24 w-full" />
    </footer>;
  }
  return <footer className="border-t bg-muted/50">
    {/* MAIN LINKS */}
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {settings.sections.map(section => <div key={section.id}>
          <h3 className="font-bold mb-3 text-sm text-foreground">{section.title}</h3>
          <ul className="space-y-1.5">
            {section.links.map(l => <li key={l.label}>
              <Link to={l.href} className="text-xs text-alibaba-textSecondary hover:text-alibaba-orange hover:underline transition-colors">
                {l.label}
              </Link>
            </li>)}
          </ul>

          {section.id === "know" && <div className="mt-6 flex gap-4 text-muted-foreground">
            <Facebook size={18} />
            <Twitter size={18} />
            <Instagram size={18} />
            <Linkedin size={18} />
            <Youtube size={18} />
          </div>}
        </div>)}
      </div>
    </div>

    {/* PAYMENT ICONS */}
    <div className="border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center items-center gap-1 sm:gap-2 shadow-none">
          {paymentIcons.map((src, i) => <img key={i} src={src} alt="payment" className="h-4 sm:h-5 md:h-6 lg:h-7 object-contain" />)}
        </div>
      </div>
    </div>

    {/* ECOSYSTEM + POLICIES */}
    <div className="border-t">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground space-y-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {ecosystemLinks.map(l => <Link key={l} to="/" className="hover:text-foreground">
            {l}
          </Link>)}
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {policyLinks.map(l => <Link key={l} to="/" className="hover:text-foreground">
            {l}
          </Link>)}
        </div>

        {/* LEGAL */}
        <div className="text-xs leading-relaxed">
          © 1999-2026 Alibaba.com。版权所有：杭州阿里巴巴海外信息技术有限公司<br />
          增值电信业务经营许可证：浙B2-20241358<br />
          Business license verification icon | GSXT verification icon<br />
          浙公网安备33010002000366 | 浙ICP备2024067534号-3
        </div>
      </div>
    </div>
  </footer>;
};