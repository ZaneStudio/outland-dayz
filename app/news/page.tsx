import { getManagedNews } from "@/lib/news-store";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getManagedNews();

  return (
    <main className="shell py-24">
      <div className="mb-12">
        <p className="eyebrow">Архів подій</p>
        <h1 className="heading mt-2 text-4xl sm:text-5xl">Усі новини сервера</h1>
      </div>

      {news.length === 0 ? (
        <div className="panel p-12 text-center text-stone-400">
          Новин поки немає.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <div 
              key={item.id} 
              id={item.slug}
              className="panel cut flex flex-col p-6 transition duration-300 hover:border-[#84955a]"
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="mb-4 h-48 w-full rounded object-cover border border-white/10" 
                />
              )}
              <p className="text-xs text-[#acbd75]">{item.date}</p>
              <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-300 whitespace-pre-wrap">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}