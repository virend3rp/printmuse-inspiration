"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export default function ProductCard({
  name,
  price,
  image,
  slug,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-white border border-neutral-200 transition duration-300 hover:-translate-y-1 hover:shadow-md">

        {/* Image */}
        <div className="relative overflow-hidden h-[240px]">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4">

          <h3 className="heading-md mb-1 line-clamp-1">
            {name}
          </h3>

          <p className="text-body font-semibold">
            ₹{price}
          </p>

        </div>

      </div>
    </Link>
  );
}