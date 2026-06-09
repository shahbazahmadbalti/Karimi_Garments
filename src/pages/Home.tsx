import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Truck,
  Shield,
  RefreshCcw,
  Headphones,
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { data: heroBanners } = trpc.banner.list.useQuery({ position: "hero" });
  const { data: featuredProducts } = trpc.product.list.useQuery({
    isFeatured: true,
    limit: 8,
  });
  const { data: newArrivals } = trpc.product.list.useQuery({
    isNewArrival: true,
    limit: 4,
  });
  const { data: bestSellers } = trpc.product.list.useQuery({
    isBestSeller: true,
    limit: 4,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides: HeroSlide[] = heroBanners && heroBanners.length > 0
    ? heroBanners.map((b) => ({
        title: b.title,
        subtitle: b.subtitle || "",
        image: b.image,
        link: b.link || "/products",
        buttonText: b.buttonText || "Shop Now",
      }))
    : [
        {
          title: "Premium Garments Collection",
          subtitle: "Discover our exclusive range of handcrafted garments made with the finest materials",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85fa8e?w=1600&h=700&fit=crop",
          link: "/products",
          buttonText: "Shop Collection",
        },
        {
          title: "New Season Arrivals",
          subtitle: "Fresh styles for the modern wardrobe. Elevate your everyday look.",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=700&fit=crop",
          link: "/products?sort=newest",
          buttonText: "Explore New",
        },
        {
          title: "Custom Uniforms & Bulk Orders",
          subtitle: "Professional garment solutions for businesses and organizations",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop",
          link: "/contact",
          buttonText: "Get Quote",
        },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const categories = [
    { name: "Men", image: "https://images.unsplash.com/photo-1490578474895-763728e1935b?w=400&h=500&fit=crop", slug: "men" },
    { name: "Women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop", slug: "women" },
    { name: "Kids", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop", slug: "kids" },
    { name: "Uniforms", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop", slug: "uniforms" },
  ];

  const features = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: RefreshCcw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: Headphones, title: "24/7 Support", desc: "Dedicated assistance" },
  ];

  const testimonials = [
    { name: "Ahmad Shah", text: "The quality of these garments is exceptional. Truly premium craftsmanship.", rating: 5 },
    { name: "Fatima Noori", text: "Best customer service I've experienced. The team went above and beyond.", rating: 5 },
    { name: "Mohammad Karim", text: "We ordered custom uniforms for our company. Professional quality and timely delivery.", rating: 5 },
  ];

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden -mt-[120px] pt-[120px]">
        {heroSlides.map((slide: HeroSlide, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative h-full flex items-center max-w-7xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={index === currentSlide ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <p className="text-amber-400 font-medium mb-3 tracking-wider uppercase text-sm">
                  Karimi Garments
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-gray-200 text-lg mb-8 max-w-lg">
                  {slide.subtitle}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate(slide.link)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 text-base"
                  >
                    {slide.buttonText}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/about")}
                    className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-base"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_s: HeroSlide, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide ? "bg-amber-500 w-8" : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <motion.div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6" {...staggerContainer}>
          {features.map((feature) => (
            <motion.div key={feature.title} {...fadeInUp} className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-gray-500 text-xs">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">Browse By</p>
            <h2 className="text-3xl md:text-4xl font-bold">Our Categories</h2>
          </motion.div>
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-6" {...staggerContainer}>
            {categories.map((cat) => (
              <motion.button key={cat.name} {...fadeInUp} onClick={() => navigate(`/products?category=${cat.slug}`)} className="group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold">{cat.name}</h3>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Shop Collection</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="flex items-end justify-between mb-12" {...fadeInUp}>
            <div>
              <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">Curated For You</p>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            </div>
            <Button variant="outline" onClick={() => navigate("/products?featured=true")} className="hidden md:flex border-black text-black hover:bg-black hover:text-white">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
          <ProductGrid products={featuredProducts?.items || []} onAddToCart={addItem} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">Just Landed</p>
            <h2 className="text-3xl md:text-4xl font-bold">New Arrivals</h2>
          </motion.div>
          <ProductGrid products={newArrivals?.items || []} onAddToCart={addItem} />
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate("/products?sort=newest")} className="border-black text-black hover:bg-black hover:text-white">
              View All New Arrivals <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16">
        <motion.div className="max-w-7xl mx-auto px-4" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=500&fit=crop" alt="Promo" className="w-full h-[300px] md:h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center">
              <div className="px-8 md:px-16 max-w-xl">
                <p className="text-amber-400 font-medium tracking-wider uppercase text-sm mb-3">Limited Time Offer</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get 20% Off Your First Order</h2>
                <p className="text-gray-200 mb-6">Use code KARIMI20 at checkout. Valid for all new customers on orders over $50.</p>
                <Button onClick={() => navigate("/products")} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">Most Popular</p>
            <h2 className="text-3xl md:text-4xl font-bold">Best Sellers</h2>
          </motion.div>
          <ProductGrid products={bestSellers?.items || []} onAddToCart={addItem} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-8" {...staggerContainer}>
            {testimonials.map((t: { name: string; text: string; rating: number }, i: number) => (
              <motion.div key={i} {...fadeInUp} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_: unknown, j: number) => (
                    <Star key={j} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <p className="font-semibold">— {t.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <motion.div className="max-w-4xl mx-auto px-4 text-center" {...fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience Quality?</h2>
          <p className="text-gray-400 text-lg mb-8">Browse our complete collection and find the perfect garments for you, your family, or your organization.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/products")} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6">
              Browse Collection <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/contact")} className="border-white text-white hover:bg-white hover:text-black px-8 py-6">
              Contact Us
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

interface ProductGridItem {
  id: number;
  name: string;
  slug: string;
  featuredImage: string | null;
  price: string;
  compareAtPrice: string | null;
  rating: string;
  isNewArrival: boolean;
}

function ProductGrid({ products, onAddToCart }: { products: ProductGridItem[]; onAddToCart: (product: any) => void }) {
  const navigate = useNavigate();

  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">No products available yet</div>;
  }

  return (
    <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" {...staggerContainer}>
      {products.map((product) => (
        <motion.div key={product.id} {...fadeInUp}>
          <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${product.slug}`)}>
              <img src={product.featuredImage || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {product.isNewArrival && <span className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-2.5 py-1 rounded">NEW</span>}
              {product.compareAtPrice && <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded">SALE</span>}
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm mb-1 line-clamp-1 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => navigate(`/products/${product.slug}`)}>{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">${Number(product.price).toFixed(2)}</span>
                {product.compareAtPrice && <span className="text-gray-400 text-xs line-through">${Number(product.compareAtPrice).toFixed(2)}</span>}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-xs text-gray-500">{product.rating}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
