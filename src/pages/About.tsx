import { motion } from "framer-motion";
import { Award, Users, Globe, Factory } from "lucide-react";

export default function About() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const stats = [
    { icon: Award, value: "28+", label: "Years of Excellence" },
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: Globe, value: "30+", label: "Countries Served" },
    { icon: Factory, value: "200+", label: "Skilled Artisans" },
  ];

  const values = [
    { title: "Quality Craftsmanship", desc: "Every garment is crafted with meticulous attention to detail using premium materials sourced globally." },
    { title: "Sustainable Practices", desc: "We are committed to eco-friendly manufacturing processes that minimize environmental impact." },
    { title: "Customer First", desc: "Our customers are at the heart of everything we do. We strive to exceed expectations with every order." },
    { title: "Innovation", desc: "We continuously invest in modern technology and techniques to improve our products and services." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="max-w-3xl" {...fadeInUp}>
            <p className="text-amber-400 font-medium tracking-wider uppercase text-sm mb-3">
              About Us
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Crafting Excellence Since 1995
            </h1>
            <p className="text-gray-300 text-lg">
              Karimi Garments has been a trusted name in premium garment manufacturing
              for nearly three decades. From humble beginnings to becoming a leading
              exporter, our journey is defined by quality, integrity, and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">
                Our Story
              </p>
              <h2 className="text-3xl font-bold mb-4">
                From a Small Workshop to Global Recognition
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 1995 by Haji Mohammad Karimi, our company started as a
                  small tailoring workshop in Kabul with just five employees. With a
                  vision to provide quality garments to the local market, we quickly
                  gained a reputation for excellence.
                </p>
                <p>
                  Over the years, we expanded our operations, invested in modern
                  machinery, and built a team of over 200 skilled artisans. Today,
                  Karimi Garments exports to over 30 countries and serves both retail
                  and wholesale customers worldwide.
                </p>
                <p>
                  Our state-of-the-art manufacturing facility combines traditional
                  craftsmanship with modern technology, allowing us to produce garments
                  that meet international quality standards while maintaining the
                  artisanal touch that sets us apart.
                </p>
              </div>
            </motion.div>
            <motion.div
              {...fadeInUp}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85fa8e?w=400&h=500&fit=crop"
                alt="Factory"
                className="rounded-xl w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
                alt="Workshop"
                className="rounded-xl w-full h-64 object-cover mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div {...fadeInUp} className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To create premium quality garments that combine traditional
                craftsmanship with modern design, delivered with exceptional customer
                service. We aim to be the most trusted garment partner for businesses
                and individuals worldwide.
              </p>
            </motion.div>
            <motion.div {...fadeInUp} className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become a global leader in sustainable garment manufacturing,
                recognized for quality, innovation, and ethical business practices. We
                envision a world where premium garments are accessible to everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">
              What Drives Us
            </p>
            <h2 className="text-3xl font-bold">Our Core Values</h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                {...fadeInUp}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Factory */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85fa8e?w=800&h=600&fit=crop"
                alt="Our Factory"
                className="rounded-xl w-full object-cover"
              />
            </motion.div>
            <motion.div {...fadeInUp}>
              <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">
                Our Facility
              </p>
              <h2 className="text-3xl font-bold mb-4">State-of-the-Art Manufacturing</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Our 50,000 sq ft manufacturing facility is equipped with the latest
                  cutting, sewing, and finishing technology. We maintain strict quality
                  control at every stage of production.
                </p>
                <ul className="space-y-2">
                  {[
                    "Automated cutting machines with 99.9% precision",
                    "500+ industrial sewing stations",
                    "In-house quality testing laboratory",
                    "Eco-friendly wastewater treatment system",
                    "Solar-powered energy for 40% of operations",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <p className="text-amber-600 font-medium tracking-wider uppercase text-sm mb-2">
              The People
            </p>
            <h2 className="text-3xl font-bold">Our Leadership Team</h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {[
              {
                name: "Haji Mohammad Karimi",
                role: "Founder & Chairman",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=350&fit=crop&crop=face",
              },
              {
                name: "Ahmad Karimi",
                role: "CEO",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=350&fit=crop&crop=face",
              },
              {
                name: "Sarah Karimi",
                role: "Creative Director",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=350&fit=crop&crop=face",
              },
            ].map((member) => (
              <motion.div
                key={member.name}
                {...fadeInUp}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-48 h-56 object-cover rounded-xl mx-auto mb-4"
                />
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
