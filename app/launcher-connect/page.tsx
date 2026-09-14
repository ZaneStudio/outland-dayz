'use client';
import { useEffect, useState } from 'react';
export default function LauncherConnect() {
  const [message,setMessage] = useState('Підключення лаунчера…');
  useEffect(() => {
    const q = new URLSearchParams(location.search), port=q.get('port'),state=q.get('state');
    if (!port || !/^\d+$/.test(port) || +port<1024 || +port>65535 || !/^[a-f0-9]{64}$/.test(state || '')) { setMessage('Некоректне посилання. Почніть вхід із лаунчера.'); return; }
    let stopped=false, busy=false;
    async function connect() {
      if (busy || stopped) return; busy=true;
      try {
        const r=await fetch('/api/auth/launcher',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state})});
        if (r.status===401) { setMessage('Увійдіть через Steam у сусідній вкладці. Ця сторінка підключить лаунчер автоматично.'); return; }
        if (!r.ok) { const error=await r.json().catch(()=>null); throw Error(error?.error || `Помилка сервера (${r.status})`); }
        const {token}=await r.json();
        const form=document.createElement('form'); form.method='POST'; form.action=`http://127.0.0.1:${port}/callback`;
        for (const [name,value] of Object.entries({token,state:state!})) { const input=document.createElement('input'); input.type='hidden';input.name=name;input.value=value;form.append(input); }
        document.body.append(form); stopped=true;form.submit();
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося підключитися. Спробуйте ще раз із лаунчера.'); }
      finally {busy=false;}
    }
    connect(); const timer=setInterval(connect,2500);return()=>{stopped=true;clearInterval(timer);};
  },[]);
  return <main style={{padding:48}}><h1>OutLand Launcher</h1><p>{message}</p><a href="/api/auth/steam" target="_blank" rel="noopener noreferrer">Увійти через Steam</a></main>;
}
