import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, ChefHat, HeartHandshake, Heart, Quote } from "lucide-react";
import BreadHero from "@assets/ChatGPT_Image_Jul_22,_2026,_10_36_42_AM_1784716629045.png";

export default function Home() {

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white flex flex-col justify-end pb-16 pt-0" style={{ minHeight: "600px" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={BreadHero}
            alt="Apex Mushroom Bread"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay — dark at bottom for text, clear at top to show bread */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-auto">
          <Badge className="mb-6" />
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
            Rise Above. <span className="text-primary">Taste the Apex.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow">
            A Mcphoebe Enterprise product — proudly baked with fresh mushrooms. Rich in flavor, packed with nutrients, and made with love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/order" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-14 px-10 w-full sm:w-auto">
              Order Your Bread Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/donate" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm h-14 px-10 w-full sm:w-auto">
              <Heart className="mr-2 h-5 w-5" />
              Donate
            </Link>
            <Link href="/referral" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-white/20 bg-transparent text-white hover:bg-white/10 h-14 px-10 w-full sm:w-auto">
              Refer & Earn 15%
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ChefHat className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-black">Our Customer, Our Gold.</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At Mcphoebe Enterprise, we believe that baking is an act of love. Located in the heart of Kumasi, we've pioneered a unique recipe that blends premium wheat with nutritious mushrooms to create a loaf unlike any other. It’s not just bread; it’s a commitment to your health and a celebration of Ghanaian innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">A Growing Community</h2>
            <p className="text-muted-foreground">Real voices from people who love Apex Mushroom Bread.</p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Steps to Order */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 z-0"></div>
            
            {[
              { title: "Place Your Order", desc: "Fill out the simple order form with your details and quantity.", step: "1" },
              { title: "Secure Payment", desc: "Pay securely via Paystack with mobile money or card.", step: "2" },
              { title: "Track & Receive", desc: "Use your order ID to track status until it reaches your door.", step: "3" }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-white">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-sm flex items-center justify-center mb-6">
                  <span className="font-serif text-3xl font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Teaser */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <HeartHandshake className="h-20 w-20 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Share the Goodness. Earn Cash.</h2>
          <p className="text-lg text-gray-300 mb-10 leading-relaxed">
            Love our mushroom bread? Become a Mcphoebe referrer and earn a <strong>15% commission</strong> on every order placed through your unique link. It's our way of saying thank you.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10 backdrop-blur-sm">
            <ul className="text-left space-y-4 max-w-sm mx-auto">
              {[
                "Register for free in 30 seconds",
                "Get a unique referral link instantly",
                "Share with friends, family, and on social media",
                "Earn 15% automatically on successful orders",
                "Track your earnings on your dashboard"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/referral" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-14 px-10">
            Join the Referral Program
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-6xl font-black text-black mb-8 tracking-tight">Ready for your first bite?</h2>
          <Link href="/order" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white shadow-xl hover:bg-gray-900 h-16 px-12 transform hover:scale-105 duration-200">
            Order Mushroom Bread
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Badge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white backdrop-blur-md", className)}>
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      Authentic Kumasi Recipe
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const ALL_TESTIMONIALS = [
  { quote: "I never thought bread could taste this good and still be healthy. The mushroom flavour is so unique — my whole family is hooked!", name: "Abena Mensah", location: "Accra, Ghana" },
  { quote: "Apex Mushroom Bread has become our go-to for breakfast. Fresh, soft, and packed with flavour. Nothing else comes close.", name: "Kweku Asante", location: "Kumasi, Ghana" },
  { quote: "I ordered for an event and the guests couldn't stop asking where the bread came from. Mcphoebe Enterprise really did something special here.", name: "Esi Boateng", location: "Takoradi, Ghana" },
  { quote: "This bread changed my mornings. It's soft, nutritious, and has this deep earthy taste I can't get enough of. Highly recommend!", name: "Yaw Darko", location: "Sunyani, Ghana" },
  { quote: "My kids refused to eat regular bread after trying Apex Mushroom Bread. That says it all. We order every week now.", name: "Akosua Frimpong", location: "Kumasi, Ghana" },
  { quote: "The quality is outstanding. You can tell it's made with real care and fresh ingredients. This is Ghanaian excellence on a plate.", name: "Kofi Agyemang", location: "Cape Coast, Ghana" },
  { quote: "I was skeptical about mushroom bread at first, but one bite and I was completely sold. It's now a staple in my house.", name: "Adjoa Amponsah", location: "Accra, Ghana" },
  { quote: "Packed it in my children's lunchboxes and the teachers even asked me where I got it from. Mcphoebe is doing amazing work!", name: "Maame Serwaa", location: "Tamale, Ghana" },
  { quote: "The delivery was quick and the bread was still warm. Absolutely delicious — I felt good eating something so wholesome.", name: "Nana Osei", location: "Kumasi, Ghana" },
  { quote: "I run a small café and my customers kept requesting more of the mushroom bread. We now stock it every single day.", name: "Afua Boafo", location: "Tema, Ghana" },
  { quote: "Healthy, affordable, and genuinely tasty. Mcphoebe Enterprise has really cracked the code on nutritious baking.", name: "Kwame Tetteh", location: "Ho, Ghana" },
  { quote: "The texture is perfect — soft inside, slightly crusty outside. I've tried many local breads, but this one is on a different level.", name: "Ama Owusu", location: "Kumasi, Ghana" },
  { quote: "Every loaf feels like it was baked with love. You taste the difference from the very first bite.", name: "Bright Asare", location: "Koforidua, Ghana" },
  { quote: "I gifted a loaf to my neighbour and now she's ordering on her own every week. This bread sells itself!", name: "Efua Danso", location: "Bolgatanga, Ghana" },
  { quote: "Best mushroom bread I've ever tasted. The nutritional value combined with the amazing taste makes it a perfect daily bread.", name: "Prince Osei-Bonsu", location: "Kumasi, Ghana" },
];

function TestimonialCarousel() {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);
  const perPage = 3;
  const totalPages = Math.ceil(ALL_TESTIMONIALS.length / perPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPage((p) => (p + 1) % totalPages);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const current = ALL_TESTIMONIALS.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="max-w-5xl mx-auto">
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-400"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        {current.map((t, i) => (
          <TestimonialCard key={i} quote={t.quote} name={t.name} location={t.location} />
        ))}
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setPage(i); setVisible(true); }, 400); }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === page ? "bg-primary scale-125" : "bg-gray-300 hover:bg-primary/50"}`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, location }: { quote: string; name: string; location: string }) {
  return (
    <div className="bg-white p-7 rounded-2xl border shadow-sm flex flex-col gap-4 transform transition-transform hover:-translate-y-1 duration-300">
      <Quote className="h-7 w-7 text-primary/40" />
      <p className="text-gray-700 leading-relaxed flex-1">"{quote}"</p>
      <div>
        <p className="font-semibold text-sm text-gray-900">{name}</p>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
    </div>
  );
}