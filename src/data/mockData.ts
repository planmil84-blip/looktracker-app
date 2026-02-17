import celeb1 from "@/assets/celeb-1.jpg";
import celeb2 from "@/assets/celeb-2.jpg";
import celeb3 from "@/assets/celeb-3.jpg";
import celeb4 from "@/assets/celeb-4.jpg";
import celeb5 from "@/assets/celeb-5.jpg";
import celeb6 from "@/assets/celeb-6.jpg";

export interface CelebLook {
  id: string;
  image: string;
  celeb: string;
  event: string;
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
    image: celeb1,
    celeb: "Hailey B.",
    event: "Paris Street Style",
    likes: 12400,
    date: "2h ago",
    items: [
      { id: "1a", brand: "Balenciaga", model: "Oversized Trench Coat", price: 3200, inStock: true, retailer: "SSENSE", category: "Outerwear" },
      { id: "1b", brand: "The Row", model: "Cashmere Knit Top", price: 890, originalPrice: 1200, inStock: true, retailer: "Net-a-Porter", category: "Tops" },
      { id: "1c", brand: "Saint Laurent", model: "Leather Leggings", price: 1490, inStock: false, retailer: "Farfetch", category: "Bottoms" },
    ],
  },
  {
    id: "2",
    image: celeb2,
    celeb: "Timothée C.",
    event: "London Fashion Week",
    likes: 8900,
    date: "4h ago",
    items: [
      { id: "2a", brand: "Prada", model: "Wool Gabardine Coat", price: 4500, inStock: true, retailer: "Prada.com", category: "Outerwear" },
      { id: "2b", brand: "Bottega Veneta", model: "Leather Belt", price: 680, inStock: true, retailer: "Matches", category: "Accessories" },
    ],
  },
  {
    id: "3",
    image: celeb3,
    celeb: "Zendaya",
    event: "Met Gala After-Party",
    likes: 24100,
    date: "6h ago",
    items: [
      { id: "3a", brand: "Versace", model: "Embroidered Gown", price: 12800, inStock: false, retailer: "Versace.com", category: "Dresses" },
      { id: "3b", brand: "Bulgari", model: "Serpenti Earrings", price: 4200, inStock: true, retailer: "Bulgari.com", category: "Jewelry" },
    ],
  },
  {
    id: "4",
    image: celeb4,
    celeb: "Travis S.",
    event: "NYC Off-Duty",
    likes: 15600,
    date: "8h ago",
    items: [
      { id: "4a", brand: "Off-White", model: "Arrow Logo Hoodie", price: 720, inStock: true, retailer: "SSENSE", category: "Tops" },
      { id: "4b", brand: "AMIRI", model: "MX1 Distressed Jeans", price: 890, inStock: true, retailer: "Farfetch", category: "Bottoms" },
      { id: "4c", brand: "Nike x Off-White", model: "Air Force 1 Low", price: 1200, originalPrice: 180, inStock: false, retailer: "StockX", category: "Shoes" },
    ],
  },
  {
    id: "5",
    image: celeb5,
    celeb: "Margot R.",
    event: "Cannes Film Festival",
    likes: 19300,
    date: "12h ago",
    items: [
      { id: "5a", brand: "Chanel", model: "Tweed Jacket", price: 6800, inStock: true, retailer: "Chanel.com", category: "Outerwear" },
      { id: "5b", brand: "Chanel", model: "Gold Hoop Earrings", price: 1200, inStock: true, retailer: "Chanel.com", category: "Jewelry" },
    ],
  },
  {
    id: "6",
    image: celeb6,
    celeb: "Austin B.",
    event: "Paris Café Moment",
    likes: 7200,
    date: "1d ago",
    items: [
      { id: "6a", brand: "Celine", model: "Classic Leather Jacket", price: 4200, inStock: true, retailer: "Celine.com", category: "Outerwear" },
      { id: "6b", brand: "Saint Laurent", model: "Wyatt Chelsea Boots", price: 1295, inStock: false, retailer: "YSL.com", category: "Shoes" },
    ],
  },
];
