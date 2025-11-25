import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  image_url?: string;
}

const eventsData: Event[] = [
  {
    id: "1",
    title: "Cagsawa Festival",
    location: "Daraga, Albay",
    date: "February 1-29",
    description:
      "The Cagsawa Festival aims to celebrate the indomitable spirit and resilience of Albayanos, and not the memory of the disaster’s horrors. The month-long Cagsawa Festival kicks off at the historic and world famous Cagsawa Ruins.",
    image_url:
      "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/552924150_847417147858310_8155731556976969512_n.png?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGziw8fxbSDe3DW3hoXKvXFeaQdTeoSPAF5pB1N6hI8AQS3zVEN-3vEtNPSHbV-xN4vopVQnUL79dtKRbdcbiTL&_nc_ohc=Dbhb8BZYQ88Q7kNvwFefbQu&_nc_oc=AdkfC9Or_XEWRaf0YIzGvMHLET_eSlmZdZe2F815F7DKK2iDnO1ZqQ5zmeyc2qnOT14&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD3wEosgEFKtjCFj4-gPVH3mqJ7nqQZ7LQfxsvZeWB5CNnvg&oe=694CBECB",
  },
  {
    id: "2",
    title: "Magayon Festival",
    location: "Province of Albay",
    date: "May 1-31",
    description:
      "Get into the beat of Albay’s biggest and grandest festival! There’s street dancing, show bands, sport competitions, and more! Join the fun and experience merrymaking the Albayano way.",
    image_url: "https://www.hlimg.com/images/events/738X538/v_1529062402e.jpg",
  },
  {
    id: "3",
    title: "Puto Festival",
    location: "Oas, Albay",
    date: "April 27 – May 8",
    description:
      "The Municipality celebrates the “Puto Festival” to develop camaraderie of Oasnuns and recognize the delicacy of the town – the 'puto'.",
    image_url: "https://scontent.fmnl3-3.fna.fbcdn.net/v/t1.15752-9/554060371_1226235612665059_5002818656739320488_n.png?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEXAMyrWx7-uoQ1S4BuzCun6Mq5V_zsG-_oyrlX_Owb72HMc8xj_upzvxOZqkfG0I0cBlyPfMyXTPaBLnQd88DM&_nc_ohc=GAkZz2xpOekQ7kNvwGN9xfO&_nc_oc=AdlmtaWGSs1w0SPeZ86HmtocWMGwrVrieEUqOTTf0YatZ7UYQ1Vz-ueB-j-mzJAd_LE&_nc_zt=23&_nc_ht=scontent.fmnl3-3.fna&oh=03_Q7cD3wGZc1b4yMjk7rlzSICzrondOdtQaQLfTuTkd0QjFdIjiw&oe=694CA659",
  },
  {
    id: "4",
    title: "Sarung Banggui Festival",
    location: "Sto. Domingo, Albay",
    date: "May 10-20",
    description:
      "Sto. Domingo is home of the immortal song of Bicol – Sarung Banggi, composed by Potenciano Gregorio. The festival coincides with the birth of the late composer.",
    image_url: "https://scontent.fmnl3-1.fna.fbcdn.net/v/t1.15752-9/554183157_1350346659966255_1987307924818112029_n.png?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFQz6MxLpdZvZZMYW9KdYK0_Q0BhwzQqe_9DQGHDNCp7w2BpDHCjDki_JB-kb3WqbQUHucCTQuIdlEifN8dvmZA&_nc_ohc=p2ZrvFP-xhIQ7kNvwG03Z5c&_nc_oc=AdkHmNDc1HwYj3PeUrVxbuO3Kx5ePEKbUM26tSlauzo_THq2V6uP3gESY9glg4O_m-I&_nc_zt=23&_nc_ht=scontent.fmnl3-1.fna&oh=03_Q7cD3wEhXAdgetiPhr7JKtuDhNGUZOe58JVLnM6UgaVRjOMcCw&oe=694CA9CA",
  },
  {
    id: "5",
    title: "Layag Festival",
    location: "Rapu-Rapu, Albay",
    date: "May 20-27",
    description:
      "Named from 'layag' (sail boat), depicting the people’s journey of faith in Rapu-Rapu.",
    image_url: "https://scontent.fmnl3-1.fna.fbcdn.net/v/t1.15752-9/557540611_1333317624901834_8086426659257181727_n.png?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFbhm1cAvwBvanfPzitGFlwVWOF_VuYv9tVY4X9W5i_2yl0bRxPo-hGBkthOj_RBgP5Fifnn9PkswVrRdNrzOfg&_nc_ohc=tEWTqOfI4AgQ7kNvwF2ZMKT&_nc_oc=AdmjSnFA6bRPqRMI_ThjXnI-TXAvAHc8hNDjv3blHoz4ZPxC5WKmz73Zo5X10EzvDqw&_nc_zt=23&_nc_ht=scontent.fmnl3-1.fna&oh=03_Q7cD3wHsvQIhbd8v8lFNN_Ty-BXgLH_dEOjfSY5PTBvvLfmdrg&oe=694CA3D1",
  },
  {
    id: "6",
    title: "Pinangat Festival",
    location: "Camalig, Albay",
    date: "June 10-24",
    description:
      "Celebrated to coincide with the town fiesta in honor of St. John the Baptist. Named after the local delicacy, Pinangat.",
    image_url: "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/563359813_1177227674301096_1568398667034631895_n.png?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHDgZ3TiAPgWaLI-PioMktmrjpcfPqSH8auOlx8-pIfxgFDJqOaBiyYVF2omElkkjWGD8KpirPlbwIqzE7umeC6&_nc_ohc=Aem2PamZu9EQ7kNvwHHUmzy&_nc_oc=Adl9R2KY-NuiP8172TSg4Cn4agHpioOPJrIINIHhHdrUjZjZ_5djOKCV-K2lDPHRBbY&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD3wF76KR1CKGtLCW-2rbY9YwWXtz5YY050s2XtWDVwhvzmw&oe=694CA544",
  },
  {
    id: "7",
    title: "Pulang–Anggui Festival",
    location: "Polangui, Albay",
    date: "June 15-30",
    description:
      "Celebrates 'Red Maria' (Angui) who loved red colors. Showcases local culture and traditions.",
    image_url: "https://scontent.fmnl37-1.fna.fbcdn.net/v/t1.15752-9/554038234_797423626407832_977502995430621216_n.png?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGyBwn4xLtVTWfzOL5Fgu-yVh1F2jp6YYRWHUXaOnphhIYvEOBs2Okqlyo2H74XhE3ADUP8q6bOvDfck-2cDc5g&_nc_ohc=HssKjtT0ldYQ7kNvwE8Y_nF&_nc_oc=Adkf0LG8syJ-7paqvm662uQfYLZpDDkPF4FxEFZSaGTRd3IKZWZTHuNuoIQrVCDwrVU&_nc_zt=23&_nc_ht=scontent.fmnl37-1.fna&oh=03_Q7cD3wGwPFlXFgx9zwWBwowx1IPw4cBK1qYVWWMSYz54WpFZlQ&oe=694CB56A",
  },
  {
    id:"8",
    title: "Tabak Festival",
    location: "Tabaco City",
    date: "June 16-25",
    description:
      "Showcases artistry of Tabaqueños in producing their own cutleries. Derived from 'tabak ko!' meaning 'my sword!'.",
    image_url: "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/550732922_24467561499593334_9184199988690452001_n.png?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeF4VvVP5OOd02VXuY6S7Dgq-jiyvEiytSf6OLK8SLK1J8hs9f_BYlAUy5VvTVZZHa3EmyV-_bE26sD8qXNA_7Zc&_nc_ohc=rtpZ33AAmO8Q7kNvwGYXudJ&_nc_oc=AdnI87b9w3X1EYajHJGo6PV9pox0fhcgwoJ7xGKu-49HrwhgTHQiEawQ1gejowCGP0A&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD3wFVs-U6h7n8sBUT6yfMLvGG6sIIFuhfApjDcWIqWA8nQg&oe=694C9554",
  },
  {
    id: "9",
    title: "Lubid Festival",
    location: "Malilipot, Albay",
    date: "July 9-18",
    description:
      "Celebrates abaca hemp ('lubid'), the region’s main livelihood. Includes street dance parade with colorful costumes.",
    image_url: "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/557827088_4127353190926715_675118453846975229_n.png?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeG0Vuj2LrLGuqkbg45UayqmRdMTHEYW4EdF0xMcRhbgR85kIq23K8w_afNVG8C0bsFO977AQsVZSR9obYXcu5WS&_nc_ohc=uqO4hO0p5BUQ7kNvwF6aPHi&_nc_oc=AdkCLp7l41MB0HLyPn2EIBK9NHTHFEvzePDaz5aa2lgsVOqAa5xKp8tV8szUvdhCowg&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD3wFaBOd8ImplcqpbiroFaIVF3fORVYkvP63NdVhk2kjdfQ&oe=694CACDF",
  },
  {
    id: "10",
    title: "Alinao Festival",
    location: "Malinao, Albay",
    date: "July 25-26",
    description:
      "Tribute to the lost Alinao trees. 'Alinao' is said to come from 'malinaw', meaning clear waters, like Vera Falls.",
    image_url: "https://scontent.fmnl37-1.fna.fbcdn.net/v/t1.15752-9/553504137_1106447588362302_2287481491094017748_n.png?_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEUiIlgMF3WXaIN3Ml4SkmA8omMQzby0gTyiYxDNvLSBCrKS5zFUa23uAewdy0I5YScKILPspZeJ7VIxSdIY3Ta&_nc_ohc=QryIbosfS74Q7kNvwGYOSBr&_nc_oc=AdkjIFSW_kFkM-rwWS-HEGRUopEKdTzhPibJYAW-e6LxqWqNaokiQRj4ed5c1aRm0wQ&_nc_zt=23&_nc_ht=scontent.fmnl37-1.fna&oh=03_Q7cD3wHxD6Cc1VMkmenM6XFQJ8971oYaW0i7kBJ7CzhrudvaWA&oe=694C99A9",
  },
  {
    id: "11",
    title: "Libon Paroy Festival",
    location: "Libon, Albay",
    date: "July 1-28",
    description:
      "Celebrates rice ('paroy') as Libon is the rice granary of Albay. Features street parade, sports fest, longest tilapia and corn grill.",
    image_url: "https://scontent.fmnl3-1.fna.fbcdn.net/v/t1.15752-9/551175623_1478964419989305_4498120771473774555_n.png?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFRlS33ucsIXhi0rDB1bbwjBMeKcL0sLDUEx4pwvSwsNUxd3yoOR3BJs9RLTVX-QbPK0rPtbqIk0_a4y11h0qFb&_nc_ohc=csYbz59TBg8Q7kNvwEkJWuW&_nc_oc=AdmoSnwHEN313m55prdKXcy4x0eUnknc9jQbcSv3mn6kXqawtdNUJ_Z-S1lu9PoGXo8&_nc_zt=23&_nc_ht=scontent.fmnl3-1.fna&oh=03_Q7cD3wGYAYykfec3dd7F18UWSYmKGcBD-5CFfMtb7MOT3W8-qA&oe=694CBFCF",
  },
  {
    id: "12",
    title: "Coron Festival",
    location: "Tiwi, Albay",
    date: "August 1-30",
    description:
      "Tiwi is known for 'Coron' or pottery products shaped in different forms and sizes.",
    image_url: "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/542369003_1325703032432984_6326648863860325330_n.png?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFzzTdNQwXXawdPe2BX8CsGLKHwo2MFJ70sofCjYwUnvcG4LDEFbx4P7L5zET5OJjiLOsDE6BVp2fZvTKnXI345&_nc_ohc=N-jX_eZbI8IQ7kNvwF7NDGG&_nc_oc=Adnx8251eK62bf-a0-J7AvIsnbZ6pAXRFTfuu8Oqukgnm9xzQqbyDoS8jx5EbVhTSRA&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD3wFt2EcIZdKs1WzqBQcOJJY0fGtQWJRY3diIgHW0XYydyw&oe=694CB9C1",
  },
  {
    id: "13",
    title: "Ibalong Festival",
    location: "Legazpi City",
    date: "August 10-19",
    description:
      "Celebrates the socio-historic-cultural heritage of Bicolanos based on the Ibalong Epic with heroes Baltog, Handyong, and Bantong.",
    image_url: "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.15752-9/551003185_794566239870353_935334780318905612_n.png?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGVyBDwWBbMM3nW3akIdjgHyf9Fxn7WTbrJ_0XGftZNuj0ZEyQhjjtMivnToOcgrfGOhM7lA16QdAgMAHfoEuON&_nc_ohc=o6ADSzlwy58Q7kNvwGunwA2&_nc_oc=AdkqTPUK4C-IZiRH8rf8o2tPI1iZx_8kVrwI1QcEWrsXN5-SeWZUGp_waTl-ud7TW78&_nc_zt=23&_nc_ht=scontent.fmnl3-2.fna&oh=03_Q7cD3wHvtm-X0k2Zvx0bAm7bduSUXJa67NmMAYiSOxaeur6yeA&oe=694CAAFB",
  },
  {
    id: "14",
    title: "Guinobatan Longganisa Festival",
    location: "Guinobatan, Albay",
    date: "August 1-15",
    description:
      "Held during town fiesta to celebrate the bounties from the land. Highlights local cuisine featuring Guinobatan Longganisa.",
    image_url: "https://scontent.fmnl3-1.fna.fbcdn.net/v/t1.15752-9/564298943_662951340215405_4484603711227568946_n.png?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHQFm94A8oYQXT8VmlchoGp9yh4gT-rnD33KHiBP6ucPXvSglyDeAndsAcTbMmk7fTL1b9Gp4XwN8xhM_q8x3j4&_nc_ohc=bFjJdzCe-qkQ7kNvwHBDEWe&_nc_oc=Adm0o6gS_vHBaKezmBdsG75Wr1sq7Y3itxs_MHAKbBad6Bga7kJ4pP_2M5Y1Y9c0MEo&_nc_zt=23&_nc_ht=scontent.fmnl3-1.fna&oh=03_Q7cD3wGD114whL3CyqnopmBpsdCiUAW_1b3EvjBELkKxU_WVZA&oe=694C895B",
  },
  {
    id: "15",
    title: "Karagumoy Festival",
    location: "Bacacay, Albay",
    date: "August 21-31",
    description:
      "Celebrates pandan ('karagumoy') used for weaving mats, hats, fans, and bags. Major product of the coastal town.",
    image_url: "https://scontent.fmnl37-2.fna.fbcdn.net/v/t1.15752-9/564085699_1139409381032816_1428621501547510353_n.png?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGW4wkY-hDHKWh6S8GwypWKbG4UgGNH7f1sbhSAY0ft_QpKi9pzePFkKbqZzyWbPiibPWyQDXfORP6u2Dcr91pe&_nc_ohc=h2Q4LSCTwoAQ7kNvwHhh94S&_nc_oc=AdltHA7CPR7EfYqko5BeqNcV1QM84lJA6jVgUXApzB7nLX4q2hpkCseuVVJz3PUpHH8&_nc_zt=23&_nc_ht=scontent.fmnl37-2.fna&oh=03_Q7cD3wGwTph5bU0N7mkD6jKUzmdW3F20tGOmJFfu74R_B_q4rA&oe=694C8BF4",
  },
  {
    id: "16",
    title: "Quipia Festival",
    location: "Jovellar, Albay",
    date: "August 21-29",
    description:
      "Annual festival coinciding with town fiesta, featuring street presentations.",
    image_url: "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.15752-9/550960785_741298018934937_2351391732845012090_n.png?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEL-ecv-RYLGOdw2SYvK6r0PyU3BG5ozRw_JTcEbmjNHEOTzrx3yeTMCCOM3yYFT77G2bX0PK1qOrOomy4TBXU4&_nc_ohc=gys7szYdRIkQ7kNvwEasqrJ&_nc_oc=AdkGyFJNEk4iSMKm70eNB459snJ2PB_bxjOSl71bGnsGK9lysqYLWGZfC206X0qiC6o&_nc_zt=23&_nc_ht=scontent.fmnl3-2.fna&oh=03_Q7cD3wEJoRBA5JqOsRUkXPJWc6dSly4r1jihiL_MZnbFSCWlOg&oe=694C9421",
  },
  {
    id: "17",
    title: "Nito–Talahib Festival",
    location: "Manito, Albay",
    date: "October 14-23",
    description:
      "Honors nito-talahib (common grass/kans grass) important in the history and livelihood of Manito.",
    image_url: "https://scontent.fmnl3-3.fna.fbcdn.net/v/t1.15752-9/564155369_1499877391251503_494975744897270252_n.png?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFFwT4mrRw9k_HL0EQ8VOYphLVxRzlodkGEtXFHOWh2QTWLt-sSPp-YxrrEvnsGXy9Uf0dFoZMrZ5sICKeFeOBn&_nc_ohc=bWmAsNFUhm4Q7kNvwGOCTFg&_nc_oc=AdkTESCVCs97Kf3f_9Uvn1TChXfs0ebKvWAa0dNY99y62hlidLTmN5WiOsi1Kb3aAB0&_nc_zt=23&_nc_ht=scontent.fmnl3-3.fna&oh=03_Q7cD3wEmoUVm_Aq6mCQot4tsuTm-aF4dldGFwPUulS6kqzebrA&oe=694CB875",
  },
  {
    id: "18",
    title: "Tinapa Festival",
    location: "Pioduran, Albay",
    date: "February 23 – March 13",
    description:
      "Celebrates culinary expertise with 'Tinapa' (smoked fish) and the municipality’s bountiful blessings.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwN-9l9RKmVeD4_g6bhBWasb_1E0Y6kJox8Q&s",
  },
  {
    id: "19",
    title: "Sunflower Festival",
    location: "Ligao City",
    date: "March 20-26",
    description:
      "Celebrated during Cityhood Anniversary, highlighting sunflowers in bloom at Kawa Kawa Hill.",
    image_url: "https://scontent.fmnl37-2.fna.fbcdn.net/v/t1.15752-9/557590518_1360933722340759_7607583167404801582_n.png?_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeE7ss9ewMBwU5mGHP6vajIpzVayQd6KXkjNVrJB3opeSJig0d7exqtNS-GlwCns7TP-iAGT4Y7ryH8C8dBtEiSi&_nc_ohc=KW0OpkH-DtsQ7kNvwHv7aLZ&_nc_oc=AdmSeZsvlR6fT3i-IQSmuZC_BOEF4ksPZV74IawwxYwwmy9FcZZjGJcSeyeH9YPy_2Y&_nc_zt=23&_nc_ht=scontent.fmnl37-2.fna&oh=03_Q7cD3wGql7yiBIqdtBSoj34aXmz-VJukH1fyFpRNrJkPT6_cyg&oe=694C8D28",
  },
];

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEvents(eventsData);
      setIsLoading(false);
    }, 500);
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Albay Festivals & Events</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                {event.image_url && (
                  <div className="h-56 w-full overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    {event.date}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventPage;