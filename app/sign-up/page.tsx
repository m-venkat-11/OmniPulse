"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight, Globe2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerUserAndSendOtp, verifyOtpAndLogin } from "@/app/auth/actions";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("company", company);

    const res = await registerUserAndSendOtp(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyOtpAndLogin(email, otp);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ivory flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm mb-12">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            <span className="w-8 h-8 rounded-md bg-forest flex items-center justify-center">
              <Globe2 size={16} className="text-brass" />
            </span>
            <span className="font-serif font-semibold text-forest text-xl">
              Braco <span className="text-brass">OmniPulse</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-forest/8 shadow-editorial p-8">
            <h1 className="font-serif text-2xl font-semibold text-forest mb-1 text-center">
              {step === "details" ? "Create an account" : "Check your email"}
            </h1>
            <p className="text-sm text-neutral-500 text-center mb-7">
              {step === "details" ? "Join Braco OmniPulse today" : `We sent a 6-digit code to ${email}`}
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center">
                {error}
              </div>
            )}

            {step === "details" ? (
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <label htmlFor="signup-name" className="block text-xs font-medium text-graphite mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full h-10 px-3.5 rounded-md border border-forest/15 bg-ivory text-sm text-graphite
                               placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass/40
                               transition-all duration-150"
                  />
                </div>
                <div>
                  <label htmlFor="signup-company" className="block text-xs font-medium text-graphite mb-1.5">
                    Company (Optional)
                  </label>
                  <input
                    id="signup-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full h-10 px-3.5 rounded-md border border-forest/15 bg-ivory text-sm text-graphite
                               placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass/40
                               transition-all duration-150"
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-medium text-graphite mb-1.5">
                    Work Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full h-10 px-3.5 rounded-md border border-forest/15 bg-ivory text-sm text-graphite
                               placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass/40
                               transition-all duration-150"
                  />
                </div>
                <Button type="submit" variant="primary" size="md" fullWidth loading={loading} icon={<UserPlus size={15} />}>
                  Create Account
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label htmlFor="otp-code" className="block text-xs font-medium text-graphite mb-1.5 text-center">
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full h-12 px-3.5 rounded-md border border-forest/15 bg-ivory text-2xl tracking-[0.5em] text-center text-graphite
                               placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass/40
                               transition-all duration-150 font-mono"
                  />
                </div>
                <Button type="submit" variant="primary" size="md" fullWidth loading={loading} iconRight={<ArrowRight size={15} />}>
                  Verify & Sign in
                </Button>
                
                <div className="mt-4 text-center">
                  <button type="button" onClick={() => { setStep("details"); setOtp(""); }} className="text-xs text-neutral-400 hover:text-forest">
                    Edit details
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-neutral-400 mt-6 pt-6 border-t border-forest/10">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-brass hover:text-brass-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
