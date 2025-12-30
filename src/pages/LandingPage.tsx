import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight, BarChart2, ScanLine, Zap } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-center selection:bg-primary/20">

            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

            <div className="z-10 container flex flex-col items-center justify-center gap-6 md:gap-10 h-full animate-in fade-in zoom-in-95 duration-1000 px-4">



                {/* Main Typography */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                        Construction <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary animate-gradient bg-300%">
                            Simpler.
                        </span>
                    </h1>

                    {/* Ultra-concise Subtitle */}
                    <p className="max-w-[42rem] mx-auto text-muted-foreground text-lg md:text-xl">
                        AI-powered onsite material requests. <br className="hidden sm:inline" />
                        Zero paperwork.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link to="/login?tab=signup" className="w-full sm:w-auto">
                        <Button size="lg" className="h-11 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full w-full">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link to="/login?tab=demo" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="h-11 px-8 text-base bg-background/50 backdrop-blur border-border/50 hover:bg-muted/50 rounded-full w-full">
                            Explore Demo
                        </Button>
                    </Link>
                </div>

                {/* Micro Features Row - Pushed to bottom relative to content */}
                <div className="grid grid-cols-3 gap-4 md:gap-12 pt-8 border-t border-border/40 w-full max-w-lg opacity-80 mt-4">
                    <div className="flex flex-col items-center gap-2">
                        <ScanLine className="h-5 w-5 text-primary" />
                        <span className="text-xs md:text-sm font-medium">AI Scan</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        <span className="text-xs md:text-sm font-medium">Real-time</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-xs md:text-sm font-medium">Fast</span>
                    </div>
                </div>
            </div>

            {/* Footer Notice */}
            <div className="absolute bottom-4 text-[10px] text-muted-foreground opacity-50">
                © {new Date().getFullYear()} Material Request Tracker
            </div>
        </div>
    )
}
