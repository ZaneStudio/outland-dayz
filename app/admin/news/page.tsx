"use client";
import { FormEvent, useEffect, useState } from "react"; 
import { FilePenLine, Pencil, Plus, Save, ShieldAlert, Trash2 } from "lucide-react"; 
import type { ManagedNews } from "@/lib/news-store";

const blank = {
  title: "", 
  text: "", 
  date: new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" })
};

export default function AdminNews() {
  const [items, setItems] = useState<ManagedNews[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [form, setForm] = useState(blank);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = () => fetch('/api/news').then(r => r.json()).then(setItems);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(async d => {
      if (!d.user) { setAllowed(false); return; }
      const probe = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      setAllowed(probe.status !== 403);
    }).catch(() => setAllowed(false));
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageBase64(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    
    const bodyData: any = {
      title: form.title,
      text: form.text,
      date: form.date,
    };

    if (imageBase64 !== null) {
      bodyData.image = imageBase64;
    }

    const res = await fetch(editing ? `/api/news/${editing}` : '/api/news', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      setMessage(editing ? 'Новину оновлено.' : 'Новину опубліковано.');
      setForm(blank);
      setImageBase64(null);
      setEditing(null);
      load();
    } else {
      setMessage('Не вдалося зберегти новину.');
    }
  };

  const edit = (item: any) => {
    setEditing(item.id);
    setForm({ title: item.title, text: item.text, date: item.date });
    setImageBase64(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm('Видалити цю новину?')) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE' });
    load();
  };

  if (allowed === null) return <main className="shell py-20"><div className="panel animate-pulse p-10">Перевіряємо доступ...</div></main>;
  if (!allowed) return <main className="shell grid min-h-[65vh] place-items-center py-14"><div className="panel max-w-lg p-9 text-center"><ShieldAlert className="mx-auto text-ember" size={38}/><h1 className="heading mt-5 text-4xl">Доступ заборонено</h1></div></main>;

  return (
    <main className="shell max-w-5xl py-14">
      <p className="eyebrow">Steam Admin · оперативні зведення</p>
      <h1 className="heading mt-2 text-5xl">Керування новинами</h1>
      
      <section className="panel cut mt-8 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#29351d]"><Plus className="text-[#c4da83]"/></span>
          <h2 className="text-xl font-bold">{editing ? 'Редагувати новину' : 'Створити новину'}</h2>
        </div>
        
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input 
            required 
            value={form.title} 
            onChange={e => setForm(x => ({ ...x, title: e.target.value }))} 
            className="bg-black/30 p-3 rounded border border-white/10 text-white" 
            placeholder="Заголовок новини"
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-stone-400">Фото для новини з комп'ютера:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              className="bg-black/30 p-3 rounded border border-white/10 text-white text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#829258] file:text-black hover:file:bg-[#96ac65] cursor-pointer"
            />
            {imageBase64 && <span className="text-xs text-[#c4da83]">Зображення успішно підготовлено до завантаження</span>}
          </div>

          <input 
            required 
            value={form.date} 
            onChange={e => setForm(x => ({ ...x, date: e.target.value }))} 
            className="bg-black/30 p-3 rounded border border-white/10 text-white" 
            placeholder="Дата, наприклад: 2 вересня 2026"
          />
          
          <textarea 
            required 
            value={form.text} 
            onChange={e => setForm(x => ({ ...x, text: e.target.value }))} 
            className="min-h-36 bg-black/30 p-3 rounded border border-white/10 text-white" 
            placeholder="Текст новини"
          />
          
          <div className="flex gap-3">
            <button className="btn"><Save size={16}/>{editing ? 'Зберегти зміни' : 'Опублікувати'}</button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(blank); setImageBase64(null); }} className="btn btn-outline">
                Скасувати
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-4 text-sm text-[#c4da83]">{message}</p>}
      </section>

      <section className="mt-10">
        <h2 className="heading text-3xl">Опубліковані новини ({items.length})</h2>
        <div className="mt-4 space-y-3">
          {items.map((item: any) => (
            <article key={item.id} className="panel cut flex flex-wrap items-center gap-4 p-5">
              {item.image ? (
                <img src={item.image} alt={item.title} className="h-14 w-20 rounded object-cover border border-white/10" />
              ) : (
                <FilePenLine className="text-[#bad47b]" size={28} />
              )}
              <div className="min-w-48 flex-1">
                <p className="text-xs text-[#b5c978]">{item.date}</p>
                <p className="mt-1 font-bold">{item.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-stone-500">{item.text}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(item)} className="btn !min-h-8 !px-3"><Pencil size={14}/>Редагувати</button>
                <button onClick={() => remove(item.id)} className="btn btn-outline !min-h-8 !px-3 !border-ember !text-red-300"><Trash2 size={14}/></button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}