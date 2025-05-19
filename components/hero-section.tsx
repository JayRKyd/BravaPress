import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-brava-900 to-brava-800 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-1/2 h-1/2 bg-teal-600/30 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div>
              <p className="inline-block py-1 px-3 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
                #1 Press Release Platform
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Get Your News <span className="text-accent">Published</span> By Premium Media
              </h1>
              <p className="text-lg md:text-xl text-brava-100 mb-6">
                Generate press releases with AI, distribute to journalists, and get published on top media outlets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="text-lg flex items-center gap-2 group bg-accent hover:bg-accent/90 text-white"
                size="lg"
                asChild
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg"
                size="lg"
              >
                See How It Works
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-brava-100 mb-3 text-sm font-medium">TRUSTED BY INNOVATIVE COMPANIES</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70">
                <div className="h-6 w-24 bg-white/90 rounded"></div>
                <div className="h-6 w-28 bg-white/90 rounded"></div>
                <div className="h-6 w-20 bg-white/90 rounded"></div>
                <div className="h-6 w-32 bg-white/90 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-1 rounded-2xl border border-white/10 shadow-xl">
            <div className="bg-gradient-to-br from-brava-800 to-brava-900 p-6 rounded-xl space-y-6">
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-full"></div>
                <div className="h-4 bg-white/10 rounded-full w-5/6"></div>
                <div className="h-4 bg-white/10 rounded-full w-2/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-accent/20 rounded-lg w-full"></div>
                <div className="h-10 bg-accent rounded-lg w-full flex items-center justify-center text-white font-medium">
                  Generate Press Release
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <div className="h-4 bg-white/10 rounded-full w-1/2 mx-auto"></div>
                <div className="flex justify-center space-x-1">
                  <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                  <div className="h-2 w-2 bg-white/40 rounded-full"></div>
                  <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                  <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                  <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
