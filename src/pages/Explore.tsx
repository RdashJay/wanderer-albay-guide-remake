import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Star, Building2, Utensils, Eye, Heart, CheckCircle, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import AccommodationsSection from "@/components/AccommodationsSection";

interface TouristSpot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  image_url: string | null;
  rating: number;
  is_hidden_gem?: boolean;
  score?: number;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
}

interface Accommodation {
  id: string;
  name: string;
  description: string;
  location: string;
  municipality: string;
  category: string[];
  image_url: string;
  price_range: string;
  rating: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  municipality: string;
  food_type: string;
  image_url: string;
}

const PLACEHOLDER_IMAGE = "/mnt/data/c64ba096-d3de-4e7a-bef4-7e83b19a8a04.png";

const Explore = () => {
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || "destinations";
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  // --- User session
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // --- Destinations
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<TouristSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // --- Accommodations
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  
  // --- Restaurants
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [activeFoodTypes, setActiveFoodTypes] = useState<string[]>([]);
  const [restaurantLoading, setRestaurantLoading] = useState(true);

  // --- Favorites / Itinerary
  const { favorites, toggleFavorite, isFavorite } = useFavorites(session?.user?.id || "");

  // --- Fetch data
  useEffect(() => {
    fetchSpots();
    fetchSubcategories();
    fetchRestaurants();
    fetchAccommodations();
  }, []);

  useEffect(() => {
    filterSpots();
  }, [spots, searchQuery, selectedCategories]);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, restaurantSearch, activeFoodTypes]);

  const fetchSpots = async () => {
    try {
      const { data } = await supabase.from("tourist_spots").select("*").order("name");
      if (data) setSpots(data);
    } catch (err) { console.error(err); }
  };

  const fetchSubcategories = async () => {
    try {
      const { data } = await supabase.from("subcategories").select("*").order("name");
      if (data) setSubcategories(data);
    } catch (err) { console.error(err); }
  };

  const fetchAccommodations = async () => {
    try {
      const { data } = await supabase.from("accommodations").select("*").order("name");
      if (data) setAccommodations(data);
    } catch (err) { console.error(err); }
  };

  const fetchRestaurants = async () => {
    setRestaurantLoading(true);
    try {
      const { data } = await supabase.from("restaurants").select("*").order("name");
      if (data) setRestaurants(data);
    } catch (err) { console.error(err); }
    setRestaurantLoading(false);
  };

  // --- Filtering
  const filterSpots = () => {
    let filtered = spots;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.municipality?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(s => selectedCategories.every(cat => s.category.includes(cat)));
    }
    setFilteredSpots(filtered);
  };

  const filterRestaurants = () => {
    let list = restaurants;
    if (activeFoodTypes.length > 0 && !activeFoodTypes.includes("All")) {
      const lowerSelected = activeFoodTypes.map(f => f.toLowerCase());
      list = list.filter(r => {
        if (!r.food_type) return false;
        const types = r.food_type.split(",").map(t => t.trim().toLowerCase());
        return lowerSelected.some(sel => types.includes(sel));
      });
    }
    if (restaurantSearch) {
      const q = restaurantSearch.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.municipality?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q)
      );
    }
    setFilteredRestaurants(list);
  };

  // --- Category / Food toggles
  const handleCategoryClick = (category: string) => {
    if (selectedCategories.includes(category)) setSelectedCategories(selectedCategories.filter(c => c !== category));
    else setSelectedCategories([...selectedCategories, category]);
  };

  const toggleFoodType = (type: string) => {
    if (type === "All") { setActiveFoodTypes(["All"]); return; }
    let current = activeFoodTypes.filter(t => t !== "All");
    if (current.includes(type)) current = current.filter(t => t !== type);
    else current.push(type);
    if (current.length === 0) current = ["All"];
    setActiveFoodTypes(current);
  };

  const baseCategories = ["Nature","Culture","Adventure","Food","Beach","Heritage","Cafes"];
  const allCategories = Array.from(new Set([...baseCategories, ...subcategories.map(s => s.name)])).sort();
  const allFoodTypes = Array.from(new Set(["All"].concat(restaurants.flatMap(r => r.food_type?.split(",").map(t => t.trim()) || []))));

  const getBadgeStyle = (selectedArray: string[], value: string) =>
    selectedArray.includes(value) ? "bg-primary/20 text-primary border border-primary/50" : "bg-muted text-foreground dark:text-white";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore <span className="text-primary">Albay</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing destinations, hotels, and restaurants across the province
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="destinations"><MapPin className="w-4 h-4 mr-2" />Destinations</TabsTrigger>
            <TabsTrigger value="accommodations"><Building2 className="w-4 h-4 mr-2" />Accommodations</TabsTrigger>
            <TabsTrigger value="restaurants"><Utensils className="w-4 h-4 mr-2" />Restaurants</TabsTrigger>
          </TabsList>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-8">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search destinations..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategories.length===0 ? "default":"outline"} size="sm" onClick={() => setSelectedCategories([])}>All ({spots.length})</Button>
                {allCategories.map(cat => <Button key={cat} variant={selectedCategories.includes(cat)?"default":"outline"} size="sm" onClick={() => handleCategoryClick(cat)}>{cat} ({spots.filter(s=>s.category.includes(cat)).length})</Button>)}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.map(spot => (
                <Card key={spot.id} className="cursor-pointer hover:shadow-xl" onClick={() => navigate(`/spot/${spot.id}`)}>
                  <div className="h-48 overflow-hidden bg-muted">
                    <img src={spot.image_url || PLACEHOLDER_IMAGE} alt={spot.name} className="w-full h-full object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="line-clamp-2">{spot.name}</span>
                      {spot.rating>0 && <div className="flex items-center gap-1 text-yellow-500 text-sm"><Star className="w-4 h-4" />{spot.rating}</div>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {spot.description && <p className="text-sm text-muted-foreground line-clamp-2">{spot.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">{spot.category.map(cat => <Badge key={cat} className={getBadgeStyle(selectedCategories, cat)}>{cat}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
              {filteredSpots.length===0 && <div className="col-span-full text-center py-12 text-muted-foreground">No destinations found</div>}
            </div>
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations">
            <AccommodationsSection userId={session?.user?.id} />
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <div className="space-y-6">
              <div className="relative max-w-3xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search restaurants..." className="pl-10" value={restaurantSearch} onChange={e => setRestaurantSearch(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {allFoodTypes.map(ft => (
                  <Button key={ft} variant={activeFoodTypes.includes(ft)?"default":"outline"} size="sm" onClick={() => toggleFoodType(ft)}>
                    {ft} ({restaurants.filter(r=>r.food_type?.includes(ft)).length})
                  </Button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantLoading ? <div className="col-span-full text-center py-12">Loading...</div> :
                  filteredRestaurants.map(rest => (
                    <Card key={rest.id} className="cursor-pointer hover:shadow-xl" onClick={() => navigate(`/restaurant/${rest.id}`)}>
                      <div className="h-48 overflow-hidden bg-muted"><img src={rest.image_url || PLACEHOLDER_IMAGE} alt={rest.name} className="w-full h-full object-cover" /></div>
                      <CardHeader><CardTitle>{rest.name}</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2"><MapPin className="w-4 h-4" />{rest.municipality || rest.location}</div>
                        {rest.food_type && <Badge className={getBadgeStyle(activeFoodTypes, rest.food_type)}>{rest.food_type}</Badge>}
                        {rest.description && <p className="text-sm text-muted-foreground line-clamp-2">{rest.description}</p>}
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;