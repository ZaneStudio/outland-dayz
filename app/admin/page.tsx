"use client";
import { ImagePlus, Pencil, Plus, Save, ShieldAlert, Trash2, Upload, Image as ImageIcon } from "lucide-react"; 
import { FormEvent, useEffect, useState } from "react"; 
import type { ManagedProduct } from "@/lib/product-store";

const blank = { name: "", description: "", category: "Інше", price: "", image: "", classname: "" };

export default function Admin() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = () => fetch('/api/products').then(r => r.json()).then(setProducts);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(async d => {
        if (!d.user) { 
          setAllowed(false); 
          return; 
        }
        const test = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        setAllowed(test.status !== 403);
      })
      .catch(() => setAllowed(false));
    load();
  }, []);

  const change = (k: string, v: string) => setForm(x => ({ ...x, [k]: v }));

  const upload = async (file?: File) => {
    if (!file) return;
    setMessage('Завантаження фото...');
    const fd = new FormData();
    fd.set('image', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (r.ok) {
      change('image', d.url);
      setMessage('Фото додано.');
    } else {
      setMessage(d.error || 'Не вдалося завантажити фото');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { 
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      image: form.image,
      classname: form.classname
    };
    
    try {
      const r = await fetch(editing ? `/api/products/${editing}` : '/api/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const text = await r.text();
      const d = text ? JSON.parse(text) : {};

      if (r.ok) {
        setForm(blank);
        setEditing(null);
        setMessage(editing ? 'Товар оновлено.' : 'Товар додано.');
        load();
      } else {
        setMessage(d.error || `Помилка сервера (${r.status})`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Помилка мережі при збереженні товару');
    }
  };

  const edit = (p: ManagedProduct) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description,
      category: p.category,
      price: String(p.price),
      image: p.image,
      classname: p.classname || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm('Видалити цей товар?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  if (allowed === null) return (
    <main className="shell py-20">
      <div className="panel animate-pulse p-10">Перевіряємо доступ...</div>
    </main>
  );

  if (!allowed) return (
    <main className="shell grid min-h-[65vh] place-items-center py-14">
      <div className="panel max-w-lg p-9 text-center">
        <ShieldAlert className="mx-auto text-ember" size={38} />
        <h1 className="heading mt-5 text-4xl">Доступ заборонено</h1>
        <p className="mt-4 text-stone-400">Ця панель доступна лише Steam ID зі списку <code>ADMIN_STEAM_IDS</code>.</p>
      </div>
    </main>
  );

  return (
    <main className="shell max-w-6xl py-14">
      <p className="eyebrow">Обмежений доступ · Steam Admin</p>
      <h1 className="heading mt-2 text-5xl">Керування магазином</h1>

      <section className="panel cut mt-8 p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#29351d]">
            <Plus className="text-[#c4da83]" />
          </span>
          <h2 className="text-xl font-bold">{editing ? 'Редагувати товар' : 'Додати товар'}</h2>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] items-start">
          
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Назва товару</label>
              <input 
                required 
                value={form.name} 
                onChange={e => change('name', e.target.value)} 
                className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white text-xs focus:border-[#c4da83] focus:outline-none" 
                placeholder="Наприклад: Пачка гвоздей" 
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Ігровий Classname (для выдачі модом)</label>
              <input 
                required 
                value={form.classname} 
                onChange={e => change('classname', e.target.value)} 
                className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#c4da83] focus:outline-none" 
                placeholder="Наприклад: NailBox або M4A1" 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Ціна (₴)</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={form.price} 
                  onChange={e => change('price', e.target.value)} 
                  className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white text-xs font-mono focus:border-[#c4da83] focus:outline-none" 
                  placeholder="30" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Категорія</label>
                <input 
                  required 
                  value={form.category} 
                  onChange={e => change('category', e.target.value)} 
                  className="w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white text-xs focus:border-[#c4da83] focus:outline-none" 
                  placeholder="Будівництво" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Фото товару</label>
              <label className="flex cursor-pointer items-center justify-center gap-3 border border-dashed border-[#71834b] p-3 rounded-xl text-xs text-[#c4da83] hover:bg-white/5 transition">
                <Upload size={17} /> 
                <span>{form.image ? 'Змінити зображення' : 'Завантажити фото'}</span>
                <input onChange={e => upload(e.target.files?.[0])} className="hidden" type="file" accept="image/*" />
              </label>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Короткий опис</label>
              <textarea 
                required 
                value={form.description} 
                onChange={e => change('description', e.target.value)} 
                className="min-h-28 w-full bg-black/30 p-3 rounded-xl border border-white/10 text-white text-xs focus:border-[#c4da83] focus:outline-none resize-none" 
                placeholder="Опис предмета для виживання..." 
              />
            </div>

            {form.image && (
              <div className="flex items-center gap-3 text-xs text-[#c4da83] bg-[#1c2413] p-3 rounded-xl border border-[#c4da83]/30">
                <ImagePlus size={16} /> 
                <span className="truncate">Шлях фото: {form.image}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="btn flex-1 justify-center cursor-pointer">
                <Save size={16} />{editing ? 'Зберегти зміни' : 'Додати товар'}
              </button>
              {editing && (
                <button 
                  type="button" 
                  onClick={() => { setEditing(null); setForm(blank); }} 
                  className="btn btn-outline cursor-pointer"
                >
                  Скасувати
                </button>
              )}
            </div>
          </form>

          <div className="bg-black/50 border border-white/15 rounded-2xl p-4 sticky top-6 space-y-3 shadow-xl">
            <p className="eyebrow text-[#c4da83] text-center tracking-widest text-[10px]">Живий шаблон картки</p>
            
            <div className="rounded-xl bg-[#12160e] border border-[#c4da83]/30 p-3.5 space-y-2.5 shadow-2xl">
              <div className="relative h-32 w-full rounded-lg overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
                {form.image ? (
                  <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={28} className="text-stone-600" />
                )}
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] uppercase font-mono text-[#c4da83] border border-white/10">
                  {form.category || "Категорія"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm truncate">{form.name || "Назва товару"}</h3>
                <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">
                  {form.description || "Короткий опис товару..."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-mono text-sm font-bold text-[#c4da83]">{form.price || "0"} ₴</span>
                <div className="h-7 w-7 rounded-lg bg-[#c4da83] text-black font-bold grid place-items-center text-xs shadow-md">
                  +
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-stone-500 text-center leading-relaxed">
              Так товар виглядає для гравців у магазині.
            </p>
          </div>

        </div>

        {message && <p className="mt-4 text-sm text-[#c4da83]">{message}</p>}
      </section>

      <section className="mt-10">
        <h2 className="heading text-3xl">Товари ({products.length})</h2>
        {!products.length ? (
          <div className="panel mt-4 p-10 text-center text-stone-400">Товарів ще немає. Додайте перший через форму вище.</div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {products.map(p => (
              <article key={p.id} className="panel flex gap-4 p-4 items-center">
                <img src={p.image} alt="" className="h-20 w-24 rounded object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {p.category} · <span className="text-[#c4da83] font-mono">{p.price} ₴</span>
                    {p.classname && <> · Клас: <span className="font-mono text-white">{p.classname}</span></>}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => edit(p)} className="btn !min-h-8 !px-3 text-xs cursor-pointer"><Pencil size={13} />Редагувати</button>
                    <button onClick={() => remove(p.id)} className="btn btn-outline !min-h-8 !px-3 !border-red-500/30 !text-red-300 text-xs cursor-pointer"><Trash2 size={13} />Видалити</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}