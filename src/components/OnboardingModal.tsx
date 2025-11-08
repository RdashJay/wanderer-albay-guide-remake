import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Mountain, Church, Waves, UtensilsCrossed, MapPin } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
}

interface UserPreferences {
  categories: string[];
  districts: string[];
}

export const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    districts: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    { name: "Nature", icon: "🌿", description: "Mountains, lakes, and natural wonders" },
    { name: "Culture", icon: "🎭", description: "Churches, heritage sites, and festivals" },
    { name: "Adventure", icon: "🧗", description: "Hiking, ziplines, and outdoor activities" },
    { name: "Food", icon: "🍴", description: "Local cuisine, cafés, and traditional dishes" },
    { name: "Beach", icon: "🏖️", description: "Resorts, island hopping, and sunset spots" },
  ];

  const districtOptions = [
    { name: "District 1", subtitle: "Coastal Wonders", icon: "🐚" },
    { name: "District 2", subtitle: "Central Adventure", icon: "🌋" },
    { name: "District 3", subtitle: "Countryside Escapes", icon: "🌾" },
  ];

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_complete: true,
          onboarding_answers: preferences as any,
          user_preferences: preferences as any,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Welcome to Wanderer! 🌋 Your profile is ready.");
      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true; // Welcome screen
      case 2:
        return preferences.categories.length > 0;
      case 3:
        return preferences.districts.length > 0;
      default:
        return true;
    }
  };

  const toggleCategory = (categoryName: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter((c) => c !== categoryName)
        : [...prev.categories, categoryName],
    }));
  };

  const toggleDistrict = (district: string) => {
    setPreferences((prev) => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6 py-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Welcome to Wanderer 🌋
            </h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Your Smart Albay Travel Companion!
            </p>
            <p className="text-muted-foreground">
              Let's personalize your adventure with a few quick questions to create the perfect itinerary for your journey.
            </p>
          </div>
        );

      case 2:
        return (
          <Card className="border-2 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                Personalize Your Albay Adventure
              </CardTitle>
              <CardDescription>
                Select your interests and we'll recommend the perfect destinations for your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {categoryOptions.map((category) => (
                  <div
                    key={category.name}
                    onClick={() => toggleCategory(category.name)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      preferences.categories.includes(category.name)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={preferences.categories.includes(category.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{category.icon}</span>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-2 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Choose Your Districts
              </CardTitle>
              <CardDescription>
                Which parts of Albay would you like to explore?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {districtOptions.map((district) => (
                <div
                  key={district.name}
                  onClick={() => toggleDistrict(district.name)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    preferences.districts.includes(district.name)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={preferences.districts.includes(district.name)}
                      className="mt-1"
                    />
                    <div className="flex-1 flex items-center gap-4">
                      <div className="text-4xl">{district.icon}</div>
                      <div>
                        <p className="font-bold text-lg">{district.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {district.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (step === 1) return "Start Onboarding";
    if (step === totalSteps) return "Explore Albay";
    return "Continue";
  };

  const handleNext = () => {
    if (step === totalSteps) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {renderStep()}

          <div className="flex justify-between items-center pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              className={`gap-2 ${step === 1 ? "w-full" : "ml-auto"}`}
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {getButtonText()}
                </>
              )}
            </Button>
          </div>

          {step > 1 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Step {step - 1} of {totalSteps - 1}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
