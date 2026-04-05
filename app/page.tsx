
import Link from "next/link";
import { ArrowRight, Zap, Code2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="h-[100dvh] flex flex-col bg-black pt-16">
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Sparkles className="w-4 h-4" />
            Transform JSON with ease
          </div>
          
          <h1 className="text-6xl font-bold text-white leading-tight">
            Transform Multiple APIs
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Into One JSON
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Combine, transform, and preview multiple API responses in real-time. 
            Build your perfect data structure with an intuitive visual interface.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Preview</h3>
            <p className="text-zinc-400 text-sm">
              See your transformed JSON instantly as you configure your APIs and mappings.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiple APIs</h3>
            <p className="text-zinc-400 text-sm">
              Fetch and combine data from multiple API endpoints into a single response.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Visual Interface</h3>
            <p className="text-zinc-400 text-sm">
              Intuitive tree view and logs to help you debug and monitor your transformations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
