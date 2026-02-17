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
    celeb: "Jennie",
    event: "Incheon Airport to Paris",
    situation: "AIRPORT",
    likes: 34200,
    date: "1h ago",
    items: [
      { id: "1a", brand: "Saint Laurent", model: "Oversized Double-Breasted Blazer", price: 3800, inStock: true, retailer: "YSL.com", category: "Outerwear" },
      { id: "1b", brand: "Jacquemus", model: "La Maille Valensole Knit Top", price: 490, inStock: false, retailer: "SSENSE", category: "Tops" },
      { id: "1c", brand: "Gentle Monster", model: "Tego Sunglasses", price: 320, inStock: true, retailer: "GentleMonster.com", category: "Accessories" },
    ],
  },
  {
    id: "2",
    image: kceleb2,
    celeb: "V (Taehyung)",
    event: "Vlog: Daily Routine in Seoul",
    situation: "VLOG",
    likes: 28900,
    date: "3h ago",
    items: [
      { id: "2a", brand: "Celine", model: "Chunky Cardigan in Cashmere", price: 3200, inStock: true, retailer: "Celine.com", category: "Outerwear" },
      { id: "2b", brand: "Bottega Veneta", model: "Cashmere Turtleneck", price: 1250, inStock: true, retailer: "BottegaVeneta.com", category: "Tops" },
    ],
  },
  {
    id: "3",
    image: kceleb3,
    celeb: "Wonyoung",
    event: "MAMA Awards Stage Look",
    situation: "STAGE",
    likes: 41500,
    date: "5h ago",
    items: [
      { id: "3a", brand: "Miu Miu", model: "Crystal-Embellished Mini Dress", price: 5800, inStock: false, retailer: "MiuMiu.com", category: "Dresses" },
      { id: "3b", brand: "Tiffany & Co.", model: "Victoria Vine Drop Earrings", price: 3200, inStock: true, retailer: "Tiffany.com", category: "Jewelry" },
    ],
  },
  {
    id: "4",
    image: kceleb4,
    celeb: "Jisoo",
    event: "Gimpo Airport Off-Duty",
    situation: "AIRPORT",
    likes: 26800,
    date: "6h ago",
    items: [
      { id: "4a", brand: "Dior", model: "Oversized Cashmere Sweater", price: 2100, inStock: true, retailer: "Dior.com", category: "Tops" },
      { id: "4b", brand: "Chanel", model: "Classic Flap Bag Medium", price: 10800, originalPrice: 8800, inStock: false, retailer: "Chanel.com", category: "Bags" },
      { id: "4c", brand: "Adidas x Wales Bonner", model: "Samba Sneakers", price: 200, inStock: true, retailer: "Adidas.com", category: "Shoes" },
    ],
  },
  {
    id: "5",
    image: kceleb5,
    celeb: "Park Seo-joon",
    event: "Gyeongseong Creature Press Tour",
    situation: "DRAMA",
    likes: 19400,
    date: "10h ago",
    items: [
      { id: "5a", brand: "Prada", model: "Single-Breasted Mohair Suit", price: 4500, inStock: true, retailer: "Prada.com", category: "Outerwear" },
      { id: "5b", brand: "Prada", model: "Saffiano Leather Shirt", price: 3200, inStock: true, retailer: "Prada.com", category: "Tops" },
    ],
  },
  {
    id: "6",
    image: kceleb6,
    celeb: "Haerin",
    event: "Vlog: Seoul Street Walk",
    situation: "VLOG",
    likes: 22100,
    date: "1d ago",
    items: [
      { id: "6a", brand: "Acne Studios", model: "Oversized Logo Hoodie", price: 450, inStock: true, retailer: "AcneStudios.com", category: "Tops" },
      { id: "6b", brand: "Prada", model: "Re-Edition Mini Shoulder Bag", price: 1350, inStock: false, retailer: "Prada.com", category: "Bags" },
    ],
  },
];
