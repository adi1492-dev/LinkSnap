'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Database, LayoutDashboard, Search, Zap, Github, Twitter, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, FormEvent } from 'react';

export default function LandingPage() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url) {
      window.location.href = `/dashboard?url=${encodeURIComponent(url)}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">LinkSnap API</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              API Dashboard
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Documentation
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-white text-slate-950 hover:bg-slate-200 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get API Key
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Now with Edge Caching & Cheerio DOM Parsing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Instant Open Graph <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Preview Metadata API
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Paste a URL and extract the title, description, high-res image, and favicon in under 200ms. Perfect for chat apps, forums, and social network clones.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSubmit} 
            className="max-w-xl mx-auto relative flex items-center"
          >
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="url" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article" 
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-36 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm shadow-2xl"
              required
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-semibold transition-colors flex items-center gap-2"
            >
              Preview <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Code Demo Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent blur-xl -z-10 rounded-3xl" />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-left">
              <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs font-mono text-slate-500">bash</div>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed">
                  <span className="text-pink-400">curl</span> <span className="text-slate-300">-X GET</span> <span className="text-green-300">"https://api.linksnap.com/api/preview?url=stripe.com"</span> \
                  <br/>
                  <span className="text-slate-300">  -H</span> <span className="text-green-300">"Authorization: Bearer pk_live_..."</span>
                  <br/><br/>
                  <span className="text-slate-500"># Response</span>
                  <br/>
                  <span className="text-blue-300">&#123;</span>
                  <br/>
                  <span className="text-cyan-300">  "data"</span><span className="text-slate-300">: </span><span className="text-blue-300">&#123;</span>
                  <br/>
                  <span className="text-cyan-300">    "title"</span><span className="text-slate-300">: </span><span className="text-yellow-300">"Stripe | Financial Infrastructure for the Internet"</span><span className="text-slate-300">,</span>
                  <br/>
                  <span className="text-cyan-300">    "description"</span><span className="text-slate-300">: </span><span className="text-yellow-300">"Stripe is a suite of APIs powering online payment processing..."</span><span className="text-slate-300">,</span>
                  <br/>
                  <span className="text-cyan-300">    "image"</span><span className="text-slate-300">: </span><span className="text-yellow-300">"https://b.stripecdn.com/site-srv/assets/img/v3/home/social.png"</span><span className="text-slate-300">,</span>
                  <br/>
                  <span className="text-cyan-300">    "domain"</span><span className="text-slate-300">: </span><span className="text-yellow-300">"stripe.com"</span>
                  <br/>
                  <span className="text-blue-300">  &#125;</span>
                  <br/>
                  <span className="text-blue-300">&#125;</span>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Infrastructure</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built to handle high-volume link parsing with intelligent fallbacks, Edge caching, and a robust developer dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code2 className="w-6 h-6 text-blue-400" />}
              title="RESTful JSON API"
              desc="Simple, predictable API endpoints with structured JSON responses. Integrate into any stack with just one HTTP request."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Sub-200ms Latency"
              desc="Powered by Cheerio HTML parsing. We bypass heavy headless browsers and use intelligent DOM querying for raw speed."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="w-6 h-6 text-purple-400" />}
              title="Developer Dashboard"
              desc="Generate secure API keys, monitor usage quotas in real-time, and view your live request logs all in one place."
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6 text-cyan-400" />}
              title="Intelligent Fallbacks"
              desc="Missing og:image? We'll check twitter:image or scrape the first high-res img tag automatically."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-pink-400" />}
              title="History & Collections"
              desc="Save your parsed links. Organize them into collections with custom tags right from the UI dashboard."
            />
            <FeatureCard 
              icon={<ArrowRight className="w-6 h-6 text-green-400" />}
              title="Handles Redirects"
              desc="Automatically resolves up to 20 native redirect chains to find the canonical Open Graph destination."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-lg">LinkSnap</span>
          </div>
          <p className="text-sm text-slate-500 text-center">
            Designed for high-performance frontend applications.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
