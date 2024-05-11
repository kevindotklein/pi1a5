import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Stripe, loadStripe } from '@stripe/stripe-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export default getStripe;