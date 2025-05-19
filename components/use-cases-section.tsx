"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState("startups")

  const useCases = [
    {
      id: "startups",
      title: "Startups & Small Businesses",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Get the word out about your startup or small business with professionally crafted press releases that attract investor interest and customer attention.",
      benefits: [
        "Build brand awareness from day one",
        "Announce funding rounds and milestones",
        "Attract potential investors and partners",
        "Establish credibility in your industry",
      ],
    },
    {
      id: "enterprises",
      title: "Enterprises & Corporations",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Maintain your enterprise's reputation and announce major company news with perfectly timed, meticulously crafted press releases.",
      benefits: [
        "Control the narrative around major announcements",
        "Distribute quarterly reports effectively",
        "Announce mergers, acquisitions and partnerships",
        "Respond professionally to industry developments",
      ],
    },
    {
      id: "agencies",
      title: "PR & Marketing Agencies",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Scale your PR agency's capabilities by leveraging our AI and distribution network to deliver exceptional results for your clients.",
      benefits: [
        "Serve more clients without expanding your team",
        "Improve client satisfaction with better results",
        "Access premium distribution channels",
        "Generate reports that showcase your success",
      ],
    },
  ]

  const currentUseCase = useCases.find((useCase) => useCase.id === activeTab)

  return (
    <section id="use-cases" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-accent">Tailored Solutions</span> for Every Need
          </h2>
          <p className="text-lg text-brava-600">
            See how organizations of all sizes use BravaPress to amplify their message and get featured in top-tier
            publications.
          </p>
        </div>

        <Tabs defaultValue="startups" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 h-auto p-1">
              {useCases.map((useCase) => (
                <TabsTrigger
                  key={useCase.id}
                  value={useCase.id}
                  className="text-base py-3 px-6 data-[state=active]:bg-brava-900 data-[state=active]:text-white"
                >
                  {useCase.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {useCases.map((useCase) => (
            <TabsContent key={useCase.id} value={useCase.id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="order-2 lg:order-1 space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold">{useCase.title}</h3>
                  <p className="text-lg text-brava-600">{useCase.description}</p>

                  <div className="space-y-3 pt-2">
                    {useCase.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button className="bg-accent hover:bg-accent/90 text-white">Learn More</Button>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
                    <Image
                      src={useCase.image || "/placeholder.svg"}
                      alt={useCase.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

export default UseCasesSection
