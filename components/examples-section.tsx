import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const ExamplesSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Marketing Director at TechStart",
      quote:
        "BravaPress helped us get featured in TechCrunch after months of trying. The AI-generated content was spot-on for our product launch.",
      avatar: "SJ",
      company: "TechStart",
      result: "Featured in TechCrunch, ZDNet, and 8 other publications",
    },
    {
      name: "Mark Peterson",
      title: "CEO of GreenEco Solutions",
      quote:
        "Our sustainability initiative got picked up by major environmental publications thanks to BravaPress's targeted distribution.",
      avatar: "MP",
      company: "GreenEco",
      result: "12 media mentions and interview requests from 3 journalists",
    },
    {
      name: "Julia Rodriguez",
      title: "PR Manager at HealthPlus",
      quote:
        "The analytics dashboard is a game-changer. We can now show our executives exactly how our press releases are performing.",
      avatar: "JR",
      company: "HealthPlus",
      result: "127% increase in media coverage compared to previous quarter",
    },
  ]

  const exampleReleases = [
    {
      title: "Product Launch",
      description: "Announcing a new product or service with compelling angles that journalists will want to cover.",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Funding Announcement",
      description: "Creating excitement around investment rounds and company growth milestones.",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Industry Research",
      description: "Publishing original research and insights that position your brand as a thought leader.",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <section id="examples" className="bg-gradient-to-b from-brava-900 to-brava-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Real <span className="text-accent">Results</span> From Real Customers
          </h2>
          <p className="text-lg text-brava-100">
            See how companies use BravaPress to get their news featured in top publications and achieve their PR goals.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-brava-200">{testimonial.title}</p>
                  </div>
                </div>
                <blockquote className="mb-4 text-brava-100">"{testimonial.quote}"</blockquote>
                <div className="pt-4 mt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-accent">RESULTS</p>
                  <p className="text-sm text-white">{testimonial.result}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example Press Releases */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">Example Press Releases</h3>
          <p className="text-lg text-brava-100">
            Here are some examples of the types of press releases our platform can help you create and distribute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exampleReleases.map((example, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={example.image || "/placeholder.svg"}
                  alt={example.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brava-900/90 via-brava-900/60 to-brava-900/30 flex flex-col justify-end p-6">
                <h4 className="text-xl font-bold mb-2">{example.title}</h4>
                <p className="text-brava-100 mb-4">{example.description}</p>
                <Link
                  href="#"
                  className="inline-flex items-center text-accent hover:text-accent/80 font-medium gap-1 group"
                >
                  View Example
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExamplesSection
