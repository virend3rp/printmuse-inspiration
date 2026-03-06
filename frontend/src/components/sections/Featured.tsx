import Image from "next/image";
import Container from "../ui/Container";
import Section from "../ui/Section";

const featured = [
  { name: "Dragon Figurine", price: "₹1499", img: "/dragon.png" },
  { name: "Utility Stand", price: "₹999", img: "/utility.png" },
  { name: "Moon Lamp", price: "₹1999", img: "/moon-lamp.png" },
];

export default function Featured() {
  return (
    <Section>
      <Container>

        <h2 className="text-2xl font-semibold mb-10">
          Featured
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {featured.map((item) => (
            <div
              key={item.name}
              className="rounded-xl overflow-hidden border border-neutral-200"
            >
              <div className="relative h-[240px]">
                <Image src={item.img} alt={item.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-neutral-500 text-sm">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

      </Container>
    </Section>
  );
}