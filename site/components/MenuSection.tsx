import { getMenu } from "@/lib/menu";
import MenuRows from "./MenuRows";

export default async function MenuSection() {
  const menu = await getMenu();
  const categories = menu.filter((cat) => cat.name.trim() && cat.items?.length > 0);

  return (
    <section className="section" id="menu" aria-label="Menu">
      <p className="eyebrow">The Carte</p>
      <h2 className="title">From the bamboo steamer</h2>
      <MenuRows categories={categories} />
    </section>
  );
}
