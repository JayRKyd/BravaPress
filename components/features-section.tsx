import type React from "react"
import { CheckCircle, FileText, Mail, Search, Target, Zap } from "lucide-react"

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string
  description: string
  icon: React.ElementType
  iconClass: string
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-brava-100/20 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${iconClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-brava-600">{description}</p>
    </div>
  )
}

const FeaturesSection = () => {
  const features = [
    {
      title: "AI Content Generation",
      description:
        "Create compelling press releases with our advanced AI that writes in the perfect journalistic style.",
      icon: FileText,
      iconClass: "bg-teal-50 text-teal-500",
    },
    {
      title: "Premium Distribution",
      description: "Distribute your press releases to over 5,000 journalists, news outlets, and media platforms.",
      icon: Mail,
      iconClass: "bg-blue-50 text-blue-500",
    },
    {
      title: "SEO Optimization",
      description: "Every press release is optimized for search engines to maximize online visibility and reach.",
      icon: Search,
      iconClass: "bg-purple-50 text-purple-500",
    },
    {
      title: "Performance Analytics",
      description: "Track the performance of your press releases with detailed analytics and engagement metrics.",
      icon: Target,
      iconClass: "bg-orange-50 text-orange-500",
    },
    {
      title: "Instant Publishing",
      description: "Get your news published on major outlets quickly, with our expedited distribution network.",
      icon: Zap,
      iconClass: "bg-yellow-50 text-yellow-500",
    },
    {
      title: "Guaranteed Placement",
      description: "Our premium packages guarantee publication on tier-1 media outlets and publications.",
      icon: CheckCircle,
      iconClass: "bg-green-50 text-green-500",
    },
  ]

  return (
    <section id="features" className="bg-brava-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Everything You Need for <span className="text-accent">Effective</span> Press Coverage
          </h2>
          <p className="text-lg text-brava-600">
            BravaPress combines AI-powered content creation with premium distribution channels to get your news the
            attention it deserves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconClass={feature.iconClass}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
