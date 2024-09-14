import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

export default function LoginPage() {
  return (
    <main>
      <h1 className="text-green-500">Login Page</h1>
    </main>
  );
}
