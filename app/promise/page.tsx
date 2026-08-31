import { CreatePromiseFlow } from "@/components/promises/CreatePromiseFlow";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata = { title: "Make a Promise | BACKED", description: "Create a Promise people can get behind." };

export default function MakePromisePage() {
  return <main className="createPage newBrand"><SiteNav/><CreatePromiseFlow/></main>;
}
