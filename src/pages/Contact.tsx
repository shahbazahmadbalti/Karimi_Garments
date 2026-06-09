import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const contactInfo = [
    { icon: MapPin, title: "Visit Us", lines: ["123 Garment District", "Kabul, Afghanistan"] },
    { icon: Phone, title: "Call Us", lines: ["+93 123 456 789", "+93 987 654 321"] },
    { icon: Mail, title: "Email Us", lines: ["info@karimigarments.com", "support@karimigarments.com"] },
    { icon: Clock, title: "Business Hours", lines: ["Mon - Sat: 9:00 AM - 6:00 PM", "Sunday: Closed"] },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-amber-400 font-medium tracking-wider uppercase text-sm mb-3">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-gray-300 max-w-xl">
              Have questions about our products or services? We'd love to hear from you.
              Reach out and our team will respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                  <info.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold mb-1">{info.title}</h3>
                {info.lines.map((line) => (
                  <p key={line} className="text-gray-500 text-sm">{line}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800"
                  disabled={submitMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>

              {/* WhatsApp CTA */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium">Prefer WhatsApp?</p>
                    <a
                      href="https://wa.me/93123456789"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-200 rounded-xl overflow-hidden h-full min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Karimi Garments</p>
                <p className="text-gray-400 text-sm">123 Garment District, Kabul</p>
                <p className="text-gray-400 text-xs mt-2">Interactive map available after deployment</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
