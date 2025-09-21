import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10">
      <div className="w-full max-w-2xl">
        <SignUpForm />
      </div>
    </div>
  );
}
