"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/types/tournament";
import { validatePlayerId, ValidationMessages } from "@/lib/utils/validation";
import { User, Building2, Trophy, Users } from "lucide-react";

interface SignUpFormData {
  email: string;
  password: string;
  repeatPassword: string;
  firstName: string;
  lastName: string;
  playerId: string;
  birthYear: string;
  userRole: UserRole;
  organizationName: string;
  organizerLicense: string;
}

export function EnhancedSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    repeatPassword: "",
    firstName: "",
    lastName: "",
    playerId: "",
    birthYear: "",
    userRole: UserRole.PLAYER,
    organizationName: "",
    organizerLicense: "",
  });
  
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Repeat password validation
    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long";
    }

    // Player ID validation
    if (!formData.playerId) {
      newErrors.playerId = ValidationMessages.PLAYER_ID_REQUIRED;
    } else if (!validatePlayerId(formData.playerId)) {
      newErrors.playerId = ValidationMessages.PLAYER_ID_INVALID;
    }

    // Birth year validation
    if (!formData.birthYear) {
      newErrors.birthYear = "Birth year is required";
    } else {
      const year = parseInt(formData.birthYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.birthYear = `Birth year must be between 1900 and ${currentYear}`;
      }
    }

    // Role-specific validation
    if (formData.userRole === UserRole.ORGANIZER) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = "Organization name is required for organizers";
      } else if (formData.organizationName.trim().length < 3) {
        newErrors.organizationName = "Organization name must be at least 3 characters long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  
const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            player_id: formData.playerId,
            user_role: formData.userRole,
          }
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create the user profile
        const profileData = {
          user_id: authData.user.id,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          player_id: formData.playerId,
          birth_year: parseInt(formData.birthYear, 10),
          user_role: formData.userRole,
          organization_name: formData.userRole === UserRole.ORGANIZER ? formData.organizationName.trim() : null,
          organizer_license: formData.userRole === UserRole.ORGANIZER && formData.organizerLicense ? formData.organizerLicense.trim() : null,
        };

        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([profileData]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If profile creation fails, we should still redirect to success
          // The user can complete their profile later
        }
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      setErrors({ email: error instanceof Error ? error.message : "An error occurred during sign up" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join the tournament community as a player or organizer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4" />
                Account Information
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="Repeat your password"
                      required
                      value={formData.repeatPassword}
                      onChange={(e) => handleInputChange("repeatPassword", e.target.value)}
                      className={errors.repeatPassword ? "border-red-500" : ""}
                    />
                    {errors.repeatPassword && <p className="text-sm text-red-500">{errors.repeatPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Trophy className="w-4 h-4" />
                Personal Information
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Your first name"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Your last name"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="playerId">Player ID</Label>
                  <Input
                    id="playerId"
                    type="text"
                    placeholder="1234567 (1-7 digits)"
                    required
                    value={formData.playerId}
                    onChange={(e) => handleInputChange("playerId", e.target.value)}
                    className={errors.playerId ? "border-red-500" : ""}
                  />
                  {errors.playerId && <p className="text-sm text-red-500">{errors.playerId}</p>}
                  <p className="text-xs text-gray-500">Your official Player ID (1-7 digits, range 1-9999999)</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="birthYear">Birth Year</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    placeholder="YYYY"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange("birthYear", e.target.value)}
                    className={errors.birthYear ? "border-red-500" : ""}
                  />
                  {errors.birthYear && <p className="text-sm text-red-500">{errors.birthYear}</p>}
                </div>
              </div>
            </div>        
    {/* Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4" />
                Account Type
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="userRole">I want to join as a</Label>
                  <Select
                    value={formData.userRole}
                    onValueChange={(value: string) => handleInputChange("userRole", value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.PLAYER}>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Player</div>
                            <div className="text-xs text-gray-500">Participate in tournaments</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value={UserRole.ORGANIZER}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Organizer</div>
                            <div className="text-xs text-gray-500">Create and manage tournaments</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Organizer-specific fields */}
                {formData.userRole === UserRole.ORGANIZER && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                      <Building2 className="w-4 h-4" />
                      Organizer Information
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          type="text"
                          placeholder="Your organization or store name"
                          required={formData.userRole === UserRole.ORGANIZER}
                          value={formData.organizationName}
                          onChange={(e) => handleInputChange("organizationName", e.target.value)}
                          className={errors.organizationName ? "border-red-500" : ""}
                        />
                        {errors.organizationName && <p className="text-sm text-red-500">{errors.organizationName}</p>}
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          The name of your store, league, or organization
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="organizerLicense">Organizer License (Optional)</Label>
                        <Input
                          id="organizerLicense"
                          type="text"
                          placeholder="Your organizer license number"
                          value={formData.organizerLicense}
                          onChange={(e) => handleInputChange("organizerLicense", e.target.value)}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Your official tournament organizer license, if you have one
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 underline underline-offset-4">
                  Sign in here
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}