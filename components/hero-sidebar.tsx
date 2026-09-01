import Link from "next/link";

type NewsItem = {
  title: string;
  description: string;
  time: string;
  image: string;
};

const news: NewsItem[] = [
  {
    title: "ВАЙП СЕРВЕРА",
    description: "Новий вайп уже на сервері! Готуйтеся до нового початку.",
    time: "2 ДН. ТОМУ",
    image: "/news/wipe.jpg",
  },
  {
    title: "ОНОВЛЕННЯ 1.24",
    description: "Додано нові предмети, виправлено помилки та покращено продуктивність.",
    time: "5 ДН. ТОМУ",
    image: "/news/update.jpg",
  },
  {
    title: "EVENT: HELICRASH",
    description: "На карті впав вертоліт з цінним лутом. Шукай та виживай!",
    time: "1 ТИЖ. ТОМУ",
    image: "/news/helicrash.jpg",
  },
  {
    title: "AIRDROP АКТИВНО",
    description: "На карту було скинуто вантаж з цінним спорядженням.",
    time: "2 ТИЖ. ТОМУ",
    image: "/news/airdrop.jpg",
  },
];

export function HeroSidebar() {
  return (
    <aside
      className="
        absolute
        right-0
        top-1/2
        z-20
        w-[420px]
        -translate-y-1/2
        pr-8
        hidden
        xl:block
      "
    >
      <div
        className="
          overflow-hidden
          border
          border-white/10
          bg-black/55
          backdrop-blur-md
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/10
            px-6
            py-5
          "
        >
          <div>
            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[#b6c980]
              "
            >
              ОСТАННІ НОВИНИ
            </span>
          </div>

          <Link
            href="/news"
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-[#b6c980]
              transition
              hover:text-white
            "
          >
            УСІ НОВИНИ →
          </Link>
        </div>

        {/* NEWS */}
        <div className="divide-y divide-white/10">
          {news.map((item, index) => (
            <Link
              href="/news"
              key={index}
              className="
                group
                flex
                gap-4
                px-6
                py-4
                transition
                duration-300
                hover:bg-white/5
              "
            >
              {/* IMAGE */}
              <div
                className="
                  h-[76px]
                  w-[100px]
                  shrink-0
                  overflow-hidden
                  rounded-sm
                  border
                  border-white/10
                  bg-black
                "
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    opacity-80
                    transition
                    duration-500
                    group-hover:scale-105
                    group-hover:opacity-100
                  "
                />
              </div>

              {/* CONTENT */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3
                    className="
                      truncate
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-[#b6c980]
                    "
                  >
                    {item.title}
                  </h3>

                  <span
                    className="
                      shrink-0
                      text-[9px]
                      font-medium
                      uppercase
                      text-stone-500
                    "
                  >
                    {item.time}
                  </span>
                </div>

                <p
                  className="
                    line-clamp-2
                    text-[11px]
                    leading-relaxed
                    text-stone-400
                  "
                >
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <Link
          href="/news"
          className="
            flex
            items-center
            justify-center
            border-t
            border-white/10
            px-6
            py-4
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-stone-400
            transition
            hover:bg-[#b6c980]/10
            hover:text-[#b6c980]
          "
        >
          ПЕРЕГЛЯНУТИ ВСІ НОВИНИ →
        </Link>
      </div>
    </aside>
  );
}