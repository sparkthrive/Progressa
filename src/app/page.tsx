import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dumbbell,
  Zap,
  Trophy,
  Heart,
  Apple,
  Users,
  Target,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center">P</div>
            PROGRESSA
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Funciones</a>
            <a href="#community" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Comunidad</a>
            <Link href="/login" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Iniciar Sesión</Link>
            <Button asChild className="rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold px-6">
              <Link href="/register">Empezar Gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-white/5 text-white border-white/10 px-4 py-1.5 rounded-full font-bold tracking-widest text-[10px] uppercase">
            <Zap className="h-3 w-3 mr-2 fill-yellow-400 text-yellow-400" /> Versión 1.0 ya disponible
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
            TU ENTRENAMIENTO, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">EVOLUCIONADO.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 font-medium mb-12 leading-relaxed">
            La plataforma definitiva para atletas que buscan la perfección. Gestiona tus rutinas, monitorea tu nutrición y compite en una comunidad de élite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-16 px-10 rounded-[2rem] bg-white text-black hover:bg-neutral-200 font-black text-xl gap-3 transition-transform active:scale-95 shadow-2xl shadow-white/10">
              <Link href="/register">COMENZAR AHORA <ArrowRight className="h-6 w-6" /></Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-16 px-10 rounded-[2rem] text-white hover:bg-white/5 font-bold text-lg gap-3">
              Ver Funciones
            </Button>

            {/* App Preview Mockup Container */}
            <div className="mt-24 relative p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent max-w-5xl mx-auto">
              <div className="rounded-[2.8rem] bg-neutral-900 overflow-hidden shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[16/10] border border-white/5">
                <img src="/hero-vibe.png" alt="Progressa App Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-neutral-950/50 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6 group">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Dumbbell className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Rutinas Inteligentes</h3>
              <p className="text-neutral-500 leading-relaxed">Constructor de rutinas avanzado con seguimiento de volumen y progresión de carga en tiempo real.</p>
            </div>
            <div className="space-y-6 group">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Apple className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Nutrición de Precisión</h3>
              <p className="text-neutral-500 leading-relaxed">Registro de macros simplificado y visualización de energía para alimentar tus entrenamientos correctamente.</p>
            </div>
            <div className="space-y-6 group">
              <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Game-On</h3>
              <p className="text-neutral-500 leading-relaxed">Sistema de niveles, XP y retos comunitarios para mantener tu motivación al máximo nivel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">¿LISTO PARA SUPERAR TUS LÍMITES?</h2>
          <p className="text-neutral-400 text-lg">Únete a cientos de atletas que ya están transformando su físico con Progressa.</p>
          <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold">
            <Link href="/register">Crear mi cuenta gratuita</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div className="h-7 w-7 rounded-lg bg-white text-black flex items-center justify-center text-sm">P</div>
            PROGRESSA
          </div>
          <div className="flex gap-8 text-sm font-bold text-neutral-500">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Contacto</a>
          </div>
          <p className="text-sm text-neutral-600">© 2026 Progressa Inc. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
