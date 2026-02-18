import kceleb1 from "@/assets/kceleb-1.jpg";
import kceleb2 from "@/assets/kceleb-2.jpg";
import kceleb3 from "@/assets/kceleb-3.jpg";
import kceleb4 from "@/assets/kceleb-4.jpg";
import kceleb5 from "@/assets/kceleb-5.jpg";
import kceleb6 from "@/assets/kceleb-6.jpg";

export type SituationTag = "AIRPORT" | "VLOG" | "STAGE" | "DRAMA";

export interface CelebLook {
  id: string;
  image: string;
  celeb: string;
  event: string;
  situation: SituationTag;
  items: LookItem[];
  likes: number;
  date: string;
}

export interface LookItem {
  id: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  retailer: string;
  category: string;
}

export const mockLooks: CelebLook[] = [
  {
    id: "1",
    image: kceleb1,
    celeb: "Wonyoung",
    event: "Incheon Airport Departure",
    situation: "AIRPORT",
    likes: 41500,
    date: "1h ago",
    items: [
      { id: "1a", brand: "Chanel", model: "Pink Wool Blazer Jacket", price: 5800, inStock: true, retailer: "Chanel.com", category: "Outerwear" },
      { id: "1b", brand: "Chanel", model: "Classic Flap Bag White", price: 10800, inStock: false, retailer: "Chanel.com", category: "Bags" },
      { id: "1c", brand: "Chanel", model: "Logo Ballerina Flats", price: 1250, inStock: true, retailer: "Chanel.com", category: "Shoes" },
    ],
  },
  {
    id: "2",
    image: kceleb2,
    celeb: "Jennie",
    event: "Airport Fashion · Chanel Look",
    situation: "AIRPORT",
    likes: 34200,
    date: "3h ago",
    items: [
      { id: "2a", brand: "Chanel", model: "CC Logo Shearling Sweater", price: 4900, inStock: true, retailer: "Chanel.com", category: "Tops" },
      { id: "2b", brand: "Chanel", model: "19 Flap Bag Black", price: 5800, inStock: true, retailer: "Chanel.com", category: "Bags" },
    ],
  },
  {
    id: "3",
    image: kceleb3,
    celeb: "Rosé",
    event: "Incheon Airport Casual",
    situation: "AIRPORT",
    likes: 28900,
    date: "5h ago",
    items: [
      { id: "3a", brand: "Saint Laurent", model: "Cropped Tank Top", price: 490, inStock: true, retailer: "YSL.com", category: "Tops" },
      { id: "3b", brand: "Saint Laurent", model: "Leather Shoulder Bag", price: 2750, inStock: true, retailer: "YSL.com", category: "Bags" },
      { id: "3c", brand: "Bottega Veneta", model: "Cargo Parachute Pants", price: 1800, inStock: false, retailer: "BottegaVeneta.com", category: "Bottoms" },
    ],
  },
  {
    id: "4",
    image: kceleb4,
    celeb: "Park Seo-joon",
    event: "Airport Off-Duty Style",
    situation: "AIRPORT",
    likes: 19400,
    date: "6h ago",
    items: [
      { id: "4a", brand: "SJYP", model: "La Marque Puffer Vest", price: 380, inStock: true, retailer: "SJYP.com", category: "Outerwear" },
      { id: "4b", brand: "Celine", model: "Graphic Logo T-Shirt", price: 590, inStock: true, retailer: "Celine.com", category: "Tops" },
    ],
  },
  {
    id: "5",
    image: kceleb5,
    celeb: "V (Taehyung)",
    event: "Summer Street Style",
    situation: "VLOG",
    likes: 38700,
    date: "10h ago",
    items: [
      { id: "5a", brand: "Celine", model: "Leopard Print Camp Collar Shirt", price: 1950, inStock: true, retailer: "Celine.com", category: "Tops" },
      { id: "5b", brand: "Cartier", model: "Tank Française Watch", price: 12500, inStock: true, retailer: "Cartier.com", category: "Accessories" },
    ],
  },
  {
    id: "6",
    image: kceleb6,
    celeb: "Dex",
    event: "Airport All-Black Techwear",
    situation: "AIRPORT",
    likes: 15800,
    date: "1d ago",
    items: [
      { id: "6a", brand: "Acronym", model: "J1A-GTKP Jacket", price: 1850, inStock: true, retailer: "Acronym.com", category: "Outerwear" },
      { id: "6b", brand: "Stone Island", model: "Cargo Pants", price: 450, inStock: true, retailer: "StoneIsland.com", category: "Bottoms" },
    ],
  },
];
