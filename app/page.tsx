// app/page.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle, Code, Laptop, Rocket, Stars, Zap, Clock, CheckCircle2, HeartHandshake, Building2, Twitter, Github, Linkedin, Instagram } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Hero Section */}
      <section className="relative flex min-h-[100vh] flex-col items-center justify-center px-4">
        {/* Background grid effect */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/50 to-white dark:via-black/50 dark:to-black"></div>
        </div>

        {/* Announcement Badge - Adjusted positioning */}
        <div className="absolute top-24 sm:top-32 w-full flex justify-center">
          <Badge 
            variant="outline" 
            className="group inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white/30 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-white/50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/50"
          >
            <Stars className="h-3 w-3 text-black dark:text-white" />
            <span className="text-xs font-medium text-black dark:text-white">
              Introducing Next-Gen Web Development Services
            </span>
            <ArrowRight className="h-3 w-3 text-black transition-transform group-hover:translate-x-0.5 dark:text-white" />
          </Badge>
        </div>

        <div className="container mx-auto max-w-7xl pt-20 sm:pt-24">
          <div className="relative z-10 grid gap-16 lg:grid-cols-2">
            {/* Left Content - Adjusted spacing for mobile */}
            <div className="relative space-y-10 mt-12 sm:mt-16">
              {/* Floating gradient orbs */}
              <div className="absolute left-0 -top-20 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse sm:-left-20"></div>
              <div className="absolute right-0 bottom-20 h-40 w-40 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-3xl animate-pulse-slow sm:-right-20"></div>

              <div className="relative space-y-6">
                <h1 className="text-4xl font-medium tracking-tight text-black dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Where Vision <br />
                  Meets{" "}
                  <span className="relative inline-flex flex-col">
                    Excellence
                    <span className="absolute -bottom-2 left-0 h-[3px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></span>
                  </span>
                </h1>
                <p className="max-w-xl text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  Transform your ideas into exceptional digital experiences with modern, 
                  high-performance solutions that captivate and convert.
                </p>
              </div>

              {/* Buttons with unique styling */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button 
                  size="lg"
                  className="group relative h-12 overflow-hidden rounded-xl bg-gradient-to-r from-black via-gray-800 to-black px-8 text-white transition-all hover:scale-105 dark:from-white dark:via-gray-200 dark:to-white dark:text-black"
                >
                  <span className="relative z-10 flex items-center text-base font-medium">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <Badge 
                  variant="outline" 
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-black px-8 text-base font-medium text-black transition-all hover:scale-105 hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  View Portfolio
                </Badge>
              </div>

              {/* Stats with unique design */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Clock, label: "Years Experience", value: "5+" },
                  { icon: CheckCircle2, label: "Projects Delivered", value: "100+" },
                  { icon: HeartHandshake, label: "Support", value: "24/7" }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="group relative overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-white/50 to-white/30 p-4 backdrop-blur-sm transition-all hover:scale-105 dark:border-white/10 dark:from-white/10 dark:to-white/5"
                  >
                    <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl transition-all group-hover:scale-150"></div>
                    <div className="relative space-y-1">
                      <stat.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <p className="text-xl font-bold text-black dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
              <div className="relative">
                <Image
                  src="/images/Matte/Scenes/scene 1.png"
                  alt="Modern Workspace"
                  width={700}
                  height={700}
                  className="relative z-10 rounded-3xl border border-black/10 bg-white/30 object-cover p-4 backdrop-blur-sm transition-all hover:scale-105 dark:border-white/10 dark:bg-black/30"
                />
                {/* Floating badges */}
                <div className="absolute left-0 top-1/4 animate-float rounded-2xl border border-black/10 bg-white/50 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/50 sm:-left-12">
                  <Zap className="h-6 w-6 text-black dark:text-white" />
                </div>
                <div className="absolute right-0 top-1/2 animate-float-delayed rounded-2xl border border-black/10 bg-white/50 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/50 sm:-right-12">
                  <Code className="h-6 w-6 text-black dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Section Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-black/10 bg-white/30 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <span className="text-black dark:text-white">Features</span>
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
              Everything you need to succeed online
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We bring together the best tools and practices to create exceptional digital experiences.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Code className="h-8 w-8" />,
                title: "Clean Code",
                description: "Maintainable, scalable code following industry best practices"
              },
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Performance First",
                description: "Lightning-fast websites optimized for speed and conversions"
              },
              {
                icon: <Laptop className="h-8 w-8" />,
                title: "Responsive Design",
                description: "Flawless experiences across all devices and screen sizes"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-white/60 to-white/30 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-black/5 dark:border-white/10 dark:from-white/10 dark:to-white/5 dark:hover:ring-white/5"
              >
                {/* Glossy effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="inline-flex rounded-xl border border-black/10 bg-gradient-to-br from-white/80 to-white/50 p-3 shadow-lg dark:border-white/10 dark:from-white/10 dark:to-white/5">
                      <div className="rounded-lg bg-black p-2 text-white dark:bg-white dark:text-black">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative gradient blob */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl transition-all duration-300 group-hover:scale-150 dark:from-blue-400/10 dark:to-purple-400/10"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-white/10 bg-white/5">
              Latest Work
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Featured Projects
            </h2>
            <p className="text-gray-400">
              Discover our most recent work and the impact we&apos;ve created for our clients.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              { image: "/images/Matte/Scenes/scene 2.png", title: "Modern Web App" },
              { image: "/images/Matte/Scenes/scene 3.png", title: "E-commerce Platform" },
              { image: "/images/Matte/Scenes/scene 4.png", title: "Portfolio Website" },
              { image: "/images/Matte/Scenes/scene 5.png", title: "Mobile Application" }
            ].map((project) => (
              <Link 
                key={project.title}
                href="#"
                className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/30 dark:border-white/10 dark:bg-black/30"
              >
                <div className="aspect-video p-2">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={500}
                    className="h-full w-full rounded-2xl object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-8">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="text-gray-300">
                      Web Development • UI/UX Design
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-black/10 bg-white/30 py-24 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Projects Completed", value: "100+" },
              { label: "Happy Clients", value: "50+" },
              { label: "Years Experience", value: "5+" },
              { label: "Team Members", value: "10+" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-black dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/30 p-8 backdrop-blur-sm dark:border-white/10 dark:bg-black/30 md:p-12">
            <div className="relative z-10 grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">
                  Ready to Start Your Project?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Join hundreds of satisfied clients who have transformed their digital presence with us.
                </p>
                <Button 
                  size="lg" 
                  className="mt-8 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <Image
                  src="/images/Matte/Scenes/scene 7.png"
                  alt="CTA illustration"
                  width={600}
                  height={400}
                  className="rounded-2xl border border-black/10 bg-white/30 p-2 backdrop-blur-sm transition-transform hover:scale-105 dark:border-white/10 dark:bg-black/30"
                />
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute right-0 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl dark:from-blue-400/20 dark:to-purple-400/20 sm:-right-32"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Section Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-black/10 bg-white/30 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <span className="text-black dark:text-white">Pricing Plans</span>
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
              Choose your perfect plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select a plan that best suits your needs
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: "Basic",
                price: "299",
                description: "For individuals & small projects",
                features: [
                  "3 Pages Website",
                  "Mobile Responsive",
                  "Basic SEO Setup",
                  "Contact Form",
                  "1 Month Support",
                  "Basic Analytics"
                ],
                icon: <Code className="h-5 w-5" />
              },
              {
                name: "Starter",
                price: "499",
                description: "Perfect for small businesses",
                features: [
                  "5 Pages Website",
                  "Mobile Responsive",
                  "Advanced SEO Setup",
                  "Contact Form",
                  "3 Months Support",
                  "Google Analytics"
                ],
                icon: <Rocket className="h-5 w-5" />
              },
              {
                name: "Professional",
                price: "999",
                description: "Ideal for growing businesses",
                features: [
                  "10 Pages Website",
                  "E-commerce Integration",
                  "Custom Animations",
                  "Advanced Features",
                  "6 Months Support",
                  "Performance Optimization"
                ],
                icon: <Stars className="h-5 w-5" />
              },
              {
                name: "Enterprise",
                price: "1999",
                description: "For large organizations",
                features: [
                  "Unlimited Pages",
                  "Custom Development",
                  "Priority Support",
                  "Advanced Security",
                  "12 Months Support",
                  "API Integration"
                ],
                icon: <Building2 className="h-5 w-5" />
              }
            ].map((plan, index) => (
              <Card
                key={index}
                className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Decorative Elements */}
                <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative flex h-full flex-col p-6">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-2">
                      {plan.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="ml-1 text-gray-400">/project</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-grow space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button - Fixed at bottom */}
                  <Button 
                    className="relative w-full overflow-hidden bg-white text-black transition-colors hover:bg-white/90"
                    size="lg"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="w-full px-4 py-8 sm:py-12">
          {/* Decorative Elements - Adjusted for mobile */}
          <div className="absolute left-0 top-0 h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-48 w-48 sm:h-96 sm:w-96 rounded-full bg-purple-500/10 blur-3xl"></div>

          {/* Main Footer Content */}
          <div className="mx-auto max-w-7xl">
            {/* Grid Layout - Responsive columns */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Astroexture</h3>
                </div>
                <p className="text-sm text-gray-400 max-w-md sm:max-w-xs">
                  Transform your ideas into exceptional digital experiences with modern, 
                  high-performance solutions.
                </p>
                {/* Social Links - Adjusted spacing */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Twitter, href: "#" },
                    { icon: Github, href: "#" },
                    { icon: Linkedin, href: "#" },
                    { icon: Instagram, href: "#" }
                  ].map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
                    >
                      <social.icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-white" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links - Responsive grid */}
              {[
                {
                  title: "Company",
                  links: ["About", "Careers", "Blog", "Contact"]
                },
                {
                  title: "Services",
                  links: ["Web Development", "UI/UX Design", "Mobile Apps", "Consulting"]
                },
                {
                  title: "Resources",
                  links: ["Documentation", "Help Center", "Privacy", "Terms"]
                }
              ].map((section, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href="#"
                          className="text-sm text-gray-400 transition-colors hover:text-white"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter Section - Responsive layout */}
            <div className="my-8 sm:my-12 border-y border-white/10 py-6 sm:py-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">
                    Subscribe to our newsletter
                  </h4>
                  <p className="text-sm text-gray-400">
                    Get the latest updates on new features and upcoming events.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus-visible:ring-white/20"
                  />
                  <Button className="bg-white text-black hover:bg-white/90 whitespace-nowrap">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Bar - Responsive stack */}
            <div className="flex flex-col gap-4 pt-6 sm:pt-8 text-center sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400 order-2 sm:order-1">
                © {new Date().getFullYear()} Astroexture. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 order-1 sm:order-2">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy"
                ].map((link, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}