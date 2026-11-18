import { useEffect, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { money, type Order } from './model';
import './website.css';

type PublicQuote = {
  folio: string;
  status: string;
  items: Order['items'];
  totals: { subtotal: number; tax: number; shipping: number; total: number; requiredDeposit: number; paid: number; balance: number };
  deliveryDate: string;
  eventDate: string;
};

const STATUS_LABEL: Record<string, string> = {
  'Solicitud recibida': 'Solicitud recibida',
  'En cotización': 'En cotización',
  'Esperando anticipo': 'Esperando anticipo',
  Agendado: 'Agendado',
  'En elaboración': 'En elaboración',
  'Listo para recoger': 'Listo para recoger',
  Entregado: 'Entregado',
  Cancelado: 'Cancelado',
};

function dateLabel(d: string) {
  if (!d) return 'Por confirmar';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function QuoteStatus() {
  const [folio, setFolio] = useState('');
  const [phone, setPhone] = useState('');
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('folio');
    if (f) setFolio(f);
  }, []);

  async function getCsrf(): Promise<string> {
    const r = await fetch('/api/quotes.php?action=csrf', { credentials: 'same-origin', cache: 'no-store' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'No se pudo iniciar la consulta');
    return data.csrf as string;
  }

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    setQuote(null);
    try {
      const url = `/api/quotes.php?action=view&folio=${encodeURIComponent(folio.trim())}&phone=${encodeURIComponent(phone.trim())}`;
      const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'No se pudo consultar la cotización');
      setQuote(data.quote as PublicQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!quote) return;
    setConfirming(true);
    setError('');
    setNotice('');
    try {
      const csrf = await getCsrf();
      const r = await fetch('/api/quotes.php?action=confirm', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ folio: quote.folio, phone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'No se pudo confirmar la cotización');
      setQuote(data.quote as PublicQuote);
      setNotice('¡Cotización confirmada! Te contactaremos por WhatsApp para coordinar el anticipo del 60% y agendar tu pedido.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setConfirming(false);
    }
  }

  // Los importes oficiales los calcula la API; incluyen IVA, envío y pagos.
  const t = quote?.totals ?? null;

  return (
    <div className="site tac-festival">
      <header className="site-header tac-topbar">
        <a href="/" className="site-brand">
          <img src="/logo-todo-artesanal.png" alt="Todo Artesanal Chiapas" />
          <span>
            Todo Artesanal <b>Chiapas</b>
          </span>
        </a>
        <nav className="site-nav">
          <a href="/">Volver al sitio</a>
        </nav>
      </header>
      <main>
        <section className="tac-quote" aria-label="Consultar mi cotización">
          <div className="tac-quote-card">
            <span className="site-section-tag">MI COTIZACIÓN</span>
            <h2>Consulta tu cotización</h2>
            <p>Escribe tu folio y el teléfono con el que pediste la cotización.</p>
            <form className="tac-quote-form" onSubmit={lookup}>
              <label>
                Folio *
                <input value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="TAC-20261117-001" required />
              </label>
              <label>
                Teléfono *
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="961 123 4567"
                  required
                />
              </label>
              <button type="submit" disabled={busy} className="tac-hero-cta">
                <Search size={18} /> {busy ? 'Consultando…' : 'Consultar'}
              </button>
            </form>
            {error && (
              <p className="tac-quote-error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="tac-quote-success" role="status">
                <CheckCircle2 size={18} /> {notice}
              </p>
            )}
            {quote && t && (
              <div className="tac-quote-result">
                <div className="tac-quote-head">
                  <div>
                    <span>Cotización {quote.folio}</span>
                    <strong>{STATUS_LABEL[quote.status] || quote.status}</strong>
                  </div>
                  <div>
                    <span>Fecha del evento</span>
                    <strong>{dateLabel(quote.eventDate)}</strong>
                  </div>
                  <div>
                    <span>Entrega</span>
                    <strong>{dateLabel(quote.deliveryDate)}</strong>
                  </div>
                </div>
                <table className="tac-quote-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Detalles</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{item.dimensions || '—'}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unitPrice > 0 ? money(item.quantity * item.unitPrice) : 'Por definir'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {quote.status === 'Solicitud recibida' && (
                  <p className="tac-quote-note">
                    Tu cotización está en revisión, te avisaremos por WhatsApp cuando tenga precio.
                  </p>
                )}
                {t.total > 0 && (
                  <div className="tac-quote-totals">
                    <div>
                      <span>Subtotal</span>
                      <strong>{money(t.subtotal)}</strong>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>{money(t.total)}</strong>
                    </div>
                    <div className="tac-quote-deposit">
                      <span>Anticipo requerido (60 %)</span>
                      <strong>{money(t.requiredDeposit)}</strong>
                    </div>
                    <div>
                      <span>Saldo</span>
                      <strong>{money(t.balance)}</strong>
                    </div>
                  </div>
                )}
                {quote.status === 'En cotización' && (
                  <button type="button" disabled={confirming} onClick={confirm} className="tac-hero-cta">
                    <CheckCircle2 size={18} /> {confirming ? 'Confirmando…' : 'Confirmar cotización'}
                  </button>
                )}
                {quote.status === 'Esperando anticipo' && (
                  <p className="tac-quote-note">
                    Tu cotización está confirmada. Para agendar tu pedido, realiza el anticipo del 60% ({money(t.requiredDeposit)}).
                    Te contactaremos por WhatsApp para coordinarlo.
                  </p>
                )}
                {quote.status === 'Agendado' && (
                  <p className="tac-quote-note">Tu pedido ya está agendado. ¡Gracias por confiar en nosotros!</p>
                )}
              </div>
            )}
            <p className="tac-quote-foot">
              ¿Aún no pides tu cotización? <a href="/#cotizar">Llena el formulario aquí</a> o escríbenos por{' '}
              <a href="https://wa.me/529612139040" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <strong>Todo Artesanal Chiapas ✿</strong>
          <span>Hecho con amor, color y tradición.</span>
        </div>
        <span>© {new Date().getFullYear()} Todo Artesanal Chiapas</span>
      </footer>
    </div>
  );
}
