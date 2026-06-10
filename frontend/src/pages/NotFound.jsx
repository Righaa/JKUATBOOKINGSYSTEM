import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="auth-link mt-4">Go home</Link>
    </div>
  );
}
