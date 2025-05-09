import MemeGenerator from "@/components/meme-generator"
import ApiStatus from "@/components/api-status"
import Footer from "@/components/footer"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
            Voice-to-Anime Meme Generator
          </h1>
          <p className="text-xl text-purple-200 mb-4">Record your voice, get an anime meme!</p>
          <Suspense fallback={null}>
            <ApiStatus />
          </Suspense>
        </header>

        <MemeGenerator />

        <Footer />
      </div>
    </main>
  )
}
