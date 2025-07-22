import type { SVGProps } from 'react';

export function PDVRsetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 21a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2" />
      <path d="M12 15a4 4 0 0 0 0-8" />
      <path d="M12 15a4 4 0 0 1 0-8" />
      <path d="M12 7h.01" />
      <path d="M12 15h.01" />
    </svg>
  );
}
