import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Coffee home">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img">
          <path d="M7 11h15v7a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-7Z" />
          <path d="M22 14h2a4 4 0 0 1 0 8h-3" />
          <path d="M11 7c0-2 2-2 2-4M17 7c0-2 2-2 2-4" />
        </svg>
      </span>
      <span>
        <strong>Coffee</strong>
        <small>payments, simply brewed</small>
      </span>
    </Link>
  );
}
