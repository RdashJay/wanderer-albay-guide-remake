import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  subcategories: string[];
  districts: string[];
  travelStyle: string;
  travelPace: string;
}

export const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    subcategories: [],
    districts: [],
    travelStyle: "",
    travelPace: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .order("name");

    if (!error && data) {
      setSubcategories(data);
    }
  };

  const handleSubmit = async () => {
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
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return preferences.categories.length > 0;
      case 2:
        return preferences.subcategories.length > 0;
      case 3:
        return preferences.districts.length > 0;
      case 4:
        return preferences.travelStyle !== "";
      case 5:
        return preferences.travelPace !== "";
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

  const toggleSubcategory = (subcategoryName: string) => {
    setPreferences((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategoryName)
        ? prev.subcategories.filter((s) => s !== subcategoryName)
        : [...prev.subcategories, subcategoryName],
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

  const getFilteredSubcategories = () => {
    if (preferences.categories.length === 0) return subcategories;
    
    const selectedCategoryIds = categories
      .filter((c) => preferences.categories.includes(c.name))
      .map((c) => c.id);
    
    return subcategories.filter((s) =>
      selectedCategoryIds.includes(s.category_id)
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Welcome to Wanderer 🌋</h2>
              <p className="text-muted-foreground">
                Your Smart Albay Travel Companion!
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                What kind of traveler are you? Select all that match your interests.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    preferences.categories.includes(category.name)
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{category.icon}</div>
                    <p className="font-medium">{category.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Your Subcategories</h2>
              <p className="text-muted-foreground">
                Select specific activities and experiences you'd like
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {getFilteredSubcategories().map((subcategory) => (
                <Card
                  key={subcategory.id}
                  className={`p-4 cursor-pointer transition-all ${
                    preferences.subcategories.includes(subcategory.name)
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() => toggleSubcategory(subcategory.name)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{subcategory.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {subcategory.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Districts</h2>
              <p className="text-muted-foreground">
                Which part of Albay do you want to explore?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: "District 1", subtitle: "Coastal Wonders", icon: "🐚" },
                { name: "District 2", subtitle: "Central Adventure", icon: "🌋" },
                { name: "District 3", subtitle: "Countryside Escapes", icon: "🌾" },
              ].map((district) => (
                <Card
                  key={district.name}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    preferences.districts.includes(district.name)
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() => toggleDistrict(district.name)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{district.icon}</div>
                    <div>
                      <p className="font-bold">{district.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {district.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Travel Style</h2>
              <p className="text-muted-foreground">Who are you traveling with?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Solo", icon: "🚶" },
                { name: "Couple", icon: "💑" },
                { name: "Family", icon: "👨‍👩‍👧" },
                { name: "Friends", icon: "👥" },
              ].map((style) => (
                <Card
                  key={style.name}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    preferences.travelStyle === style.name
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      travelStyle: style.name,
                    }))
                  }
                >
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{style.icon}</div>
                    <p className="font-medium">{style.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Travel Pace</h2>
              <p className="text-muted-foreground">
                What kind of travel experience do you prefer?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: "Relaxing", icon: "🕊️" },
                { name: "Thrilling", icon: "⚡" },
                { name: "Balanced", icon: "🎒" },
              ].map((pace) => (
                <Card
                  key={pace.name}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    preferences.travelPace === pace.name
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      travelPace: pace.name,
                    }))
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{pace.icon}</div>
                    <p className="font-bold">{pace.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌋</div>
              <h2 className="text-3xl font-bold">
                Thanks, Traveler!
              </h2>
              <p className="text-lg text-muted-foreground">
                Your Wanderer profile is ready.
              </p>
              <div className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                <p>📍 You'll explore: {preferences.districts.join(", ")}</p>
                <p>🎯 Your interests: {preferences.categories.join(", ")}</p>
                <p>👥 Traveling: {preferences.travelStyle}</p>
                <p>⚡ Pace: {preferences.travelPace}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Progress value={(step / totalSteps) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Step {step} of {totalSteps}
            </p>
          </div>

          {renderStep()}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <Button
              className="ml-auto"
              onClick={() => {
                if (step === totalSteps) {
                  handleSubmit();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed()}
            >
              {step === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
