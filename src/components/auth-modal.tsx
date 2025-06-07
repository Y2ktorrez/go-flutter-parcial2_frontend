"use client";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/use-auth";

/* ---------- validaciones (igual que antes) ---------- */
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateForm = (d: any, isLogin: boolean) => {
  const e: Record<string, string> = {};
  if (!isLogin && (!d.name || d.name.trim().length < 2))
    e.name = "Name must be at least 2 characters.";
  if (!d.email) e.email = "Email is required.";
  else if (!validateEmail(d.email))
    e.email = "Please enter a valid email address.";
  if (!d.password || d.password.length < 6)
    e.password = "Password must be at least 6 characters.";
  if (!isLogin && d.password !== d.confirmPassword)
    e.confirmPassword = "Passwords don't match";
  return e;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: Props) {
  const { login, signup } = useAuth();
  

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ----------  handlers  ---------- */
  const handleSubmit = async () => {
    const errs = validateForm(form, isLogin);
    if (Object.keys(errs).length) return setFormErrors(errs);

    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else
        await signup({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      onClose(); // se cierra si todo sale bien
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md relative"
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center text-white">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* ---------- Campos del formulario ---------- */}
                {!isLogin && (
                  <div>
                    <label className="block mb-1 text-sm text-gray-300">
                      Name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      disabled={isLoading}
                      placeholder="Your name"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-sm text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm text-gray-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block mb-1 text-sm text-gray-300">
                      Confirm password
                    </label>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? "Signing In…" : "Creating Account…"}
                    </>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-gray-400">
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={isLoading}
                    className="text-white hover:text-gray-300"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
