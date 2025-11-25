import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowLeft, Star, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

interface Accommodation {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  image_url: string | null;
  contact_number: string | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
  price_range: string | null;
  amenities: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name: string;
}

const AccommodationsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // --- Fetch session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch accommodation
  useEffect(() => {
    if (id) fetchAccommodation();
  }, [id]);

  const fetchAccommodation = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("accommodations").select("*").eq("id", id).single();
    if (!error && data) setAccommodation(data);
    setIsLoading(false);
  };

  // --- Fetch reviews
  useEffect(() => {
    if (!accommodation) return;
    fetchReviews();
  }, [accommodation, reviewRefreshTrigger]);

  const fetchReviews = async () => {
    setIsReviewsLoading(true);
    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("spot_id", accommodation!.id) // Use spot_id column
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setIsReviewsLoading(false);
      return;
    }

    const enrichedReviews: Review[] = [];
    for (const review of reviewsData || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", review.user_id)
        .single();
      enrichedReviews.push({ ...review, user_name: profile?.full_name || "Anonymous" });
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

  if (!accommodation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center text-muted-foreground">
          Accommodation not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/explore", { state: { tab: "accommodations" } })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accommodations
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {accommodation.image_url && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={accommodation.image_url}
                  alt={accommodation.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{accommodation.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {accommodation.category.map(cat => (
                    <Badge key={cat} className={getCategoryBadgeStyle()}>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {accommodation.description && (
                  <p className="text-muted-foreground">{accommodation.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{accommodation.location}</span>
                  </div>
                  {accommodation.municipality && (
                    <div className="text-sm text-muted-foreground ml-7">
                      {accommodation.municipality}
                    </div>
                  )}
                  {accommodation.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>{accommodation.contact_number}</span>
                    </div>
                  )}
                  {accommodation.price_range && (
                    <div className="text-sm ml-7 text-muted-foreground">
                      Price Range: {accommodation.price_range}
                    </div>
                  )}
                  {accommodation.rating !== null && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{accommodation.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
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
                      currentUserId={session?.user?.id || null}
                      reviews={reviews}
                      isLoading={isReviewsLoading}
                      fetchReviews={fetchReviews}
                    />
                  </TabsContent>

                  <TabsContent value="write" className="mt-6">
                    {session && (
                      <ReviewForm
                        spotId={accommodation.id} // send as spotId
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
            {accommodation.latitude && accommodation.longitude && (
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
    </div>
  );
};

export default AccommodationsDetail;