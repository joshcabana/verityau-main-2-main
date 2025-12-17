import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))]">
      {/* Header */}
      <div className="bg-[hsl(var(--ink))]/95 border-b border-white/10 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/verity-plus")}
            className="text-white hover:text-accent hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="section-header text-2xl text-white">Checkout</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 md:p-12 space-y-8 text-center bg-white/5 border-white/10 backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-accent" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="section-header text-2xl text-white">
              Checkout Page
            </h2>
            <p className="body-base text-white/70">
              Payment integration coming soon. This is a placeholder for the checkout flow.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Verity Plus</span>
              <span className="text-accent font-semibold">$19/month</span>
            </div>
            <p className="text-sm text-white/50 text-left">
              Billed monthly • Cancel anytime
            </p>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-12"
              onClick={() => {
                // Mock successful upgrade
                navigate("/main");
              }}
            >
              Complete upgrade
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/verity-plus")}
            >
              Back to details
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
