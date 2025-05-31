import Hero from "./components/hero"
import Portfolio from "./components/portfolio"
import Footer from "./components/footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <Portfolio />
      <Footer />
    </main>
  )
}
