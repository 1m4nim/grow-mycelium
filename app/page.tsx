// app/page.tsx
"use client";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";

export default function Home() {
  return (
    <main>
      <MyceliumGrowth />
    </main>
  );
}
