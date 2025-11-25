import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  food_type: string | null;
  image_url: string | null;
  contact_number?: string | null;
  rating?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  price_range?: string | null;
  amenities?: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name: string;
}

const RestaurantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Session
  const [session, setSession] = useState<any>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  // --- Fetch session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch restaurant
  useEffect(() => {
    if (id) fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single();
    if (!error && data) {
      const d = data as any;
      setRestaurant({
        id: d.id,
        name: d.name,
        description: d.description || null,
        location: d.location,
        municipality: d.municipality || null,
        image_url: d.image_url || null,
        food_type: d.food_type || null,
        contact_number: d.contact_number || null,
        rating: d.rating || null,
        latitude: d.latitude || null,
        longitude: d.longitude || null,
        price_range: d.price_range || null,
        amenities: d.amenities || [],
      });
    }
    setIsLoading(false);
  };

  // --- Fetch reviews
  useEffect(() => {
    if (!restaurant) return;
    fetchReviews();
  }, [restaurant, reviewRefreshTrigger]);

  const fetchReviews = async () => {
    if (!restaurant) return;
    setIsReviewsLoading(true);
    const { data: reviewsData, error } = await supabase
      .from<any, any>("reviews")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setIsReviewsLoading(false);
      return;
    }

    const enrichedReviews: Review[] = [];
    const reviewsArray = (reviewsData || []) as any[];
    for (const review of reviewsArray) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", review.user_id)
        .single();
      enrichedReviews.push({ ...(review as Review), user_name: profile?.full_name || "Anonymous" });
    }

    setReviews(enrichedReviews);
    setUserHasReviewed(enrichedReviews.some(r => r.user_id === session?.user?.id));
    setIsReviewsLoading(false);
  };

  const getCategoryBadgeStyle = () => "bg-muted text-foreground dark:text-white";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center text-muted-foreground">
          Restaurant not found
        </div>
      </div>
    );
  }

  return (
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/explore", { state: { tab: "restaurants" } })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </Button>


        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {restaurant.image_url && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{restaurant.name}</CardTitle>
                {restaurant.food_type && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryBadgeStyle()}>{restaurant.food_type}</Badge>
                  </div>
                )}
                {restaurant.rating && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {restaurant.description && (
                  <p className="text-muted-foreground">{restaurant.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{restaurant.location}</span>
                  </div>
                  {restaurant.municipality && (
                    <div className="text-sm text-muted-foreground ml-7">
                      {restaurant.municipality}
                    </div>
                  )}
                  {restaurant.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>{restaurant.contact_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews & Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reviews">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reviews">All Reviews</TabsTrigger>
                    <TabsTrigger value="write" disabled={!session}>
                      {session ? "Write Review" : "Login to Review"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="reviews" className="mt-6">
                    <ReviewList
                      {...({
                        spotId: restaurant.id,
                        currentUserId: session?.user?.id || null,
                        refreshTrigger: reviewRefreshTrigger,
                        reviews,
                        fetchReviews,
                      } as any)}
                    />
                  </TabsContent>

                  <TabsContent value="write" className="mt-6">
                    {session && (
                      <ReviewForm
                        spotId={restaurant.id}
                        userId={session.user.id}
                        onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)}
                        hasUserReviewed={userHasReviewed}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {restaurant.latitude && restaurant.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Location on Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Map view coming soon</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default RestaurantDetail;
