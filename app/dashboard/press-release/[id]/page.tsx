import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Edit, ExternalLink, Clock } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface PressReleasePageProps {
  params: {
    id: string
  }
}

export default function PressReleasePage({ params }: PressReleasePageProps) {
  // In a real app, you would fetch the press release data based on the ID
  const pressRelease = {
    id: params.id,
    title: "Company XYZ Launches Revolutionary Product",
    status: "Published",
    date: "2023-04-20",
    publishDate: "2023-04-20T09:00:00Z",
    company: "Company XYZ",
    location: "San Francisco, CA",
    contact: "John Smith",
    email: "john@companyxyz.com",
    phone: "(555) 123-4567",
    website: "https://companyxyz.com",
    summary:
      "Company XYZ announced today the launch of their revolutionary product that will transform the industry...",
    body: `
      <p><strong>SAN FRANCISCO, CA - April 20, 2023</strong> - Company XYZ, a leader in innovative technology solutions, announced today the launch of their revolutionary product that promises to transform the industry.</p>
      
      <p>The new product, named "ProductX," combines cutting-edge technology with user-friendly design to address long-standing challenges in the market. Early adopters have reported significant improvements in efficiency and cost savings.</p>
      
      <p>"We're thrilled to bring ProductX to market after years of research and development," said Jane Doe, CEO of Company XYZ. "This represents a major milestone in our mission to revolutionize how businesses operate."</p>
      
      <p>Key features of ProductX include:</p>
      <ul>
        <li>Advanced AI capabilities that adapt to user behavior</li>
        <li>Seamless integration with existing systems</li>
        <li>Enhanced security protocols to protect sensitive data</li>
        <li>Intuitive interface requiring minimal training</li>
      </ul>
      
      <p>Industry analysts have praised the innovation, with Tech Insights calling it "a game-changer that sets a new standard for the industry."</p>
      
      <p>ProductX is available immediately for enterprise customers, with a consumer version planned for release later this year.</p>
      
      <p><strong>About Company XYZ</strong><br>
      Company XYZ is a technology leader focused on developing innovative solutions that help businesses thrive in the digital age. Founded in 2010, the company has received numerous awards for its groundbreaking products and services.</p>
      
      <p><strong>Contact Information:</strong><br>
      John Smith<br>
      Public Relations Manager<br>
      Company XYZ<br>
      john@companyxyz.com<br>
      (555) 123-4567</p>
    `,
    hasDistributionReport: true,
    distributionReportUrl: "#",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Press Release Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/press-release/${params.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {pressRelease.hasDistributionReport && (
            <Link href={pressRelease.distributionReportUrl}>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Distribution Report
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{pressRelease.title}</CardTitle>
              <CardDescription>Published on {new Date(pressRelease.publishDate).toLocaleDateString()}</CardDescription>
            </div>
            <Badge variant={pressRelease.status === "Published" ? "default" : "outline"}>{pressRelease.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                <p>{pressRelease.company}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p>{pressRelease.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                <a
                  href={pressRelease.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {pressRelease.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                <p>{pressRelease.contact}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <a href={`mailto:${pressRelease.email}`} className="text-primary hover:underline">
                  {pressRelease.email}
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{pressRelease.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
            <p>{pressRelease.summary}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Press Release Content</h3>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: pressRelease.body }}
            />
          </div>

          {!pressRelease.hasDistributionReport && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Distribution report will be available 24 hours after publication.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
