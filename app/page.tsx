const steps = [
  { n: "1", t: "Sign in", d: "Use your email or Google. A secure wallet is created for you in seconds." },
  { n: "2", t: "Add USDC", d: "Receive USDC or EURC on Arc to your Payworld address." },
  { n: "3", t: "Send to anyone", d: "Pay by email, @username or wallet. New to Payworld? They claim it with a link." },
];
const feats = [
  { t: "Fast", d: "Payments settle in seconds on Arc." },
  { t: "Low fees", d: "Gas is paid in USDC, so costs stay predictable." },
  { t: "Secure", d: "Your wallet is protected by Privy. Your funds, your control." },
  { t: "Global", d: "Pay anyone, anywhere, with a username or a link." },
];

export default function Home() {
  return (
    <main className="pw">
      <div className="pw-wrap">
        <nav className="pw-nav">
          <a className="pw-brand" href="/"><img src="/logo.svg" alt="" />Payworld</a>
          <div className="pw-links"><a href="#how">How it works</a><a href="#why">Why Payworld</a><a href="#arc">Arc</a></div>
          <a className="pw-btn gold" href="/login">Open app</a>
        </nav>

        <section className="pw-hero">
          <div>
            <span className="pw-pill">Live on Arc Mainnet</span>
            <h1>Send money like you send a <span>message.</span></h1>
            <p className="pw-lead">Fast, borderless USDC payments on Arc. Pay anyone by email, @username or wallet. No crypto knowledge needed.</p>
            <div className="pw-cta">
              <a className="pw-btn gold" href="/login">Get started</a>
              <a className="pw-btn" href="#how">How it works</a>
            </div>
            <div className="pw-chips"><span>USDC</span><span>EURC</span><span>Email</span><span>@username</span></div>
          </div>
          <div className="pw-phone">
            <div className="pw-bal">
              <small>Total balance</small>
              <b>$248.32</b>
              <em>+2.4% this week</em>
            </div>
            <div className="pw-tx"><span className="dot up" /><div><b>@mariam</b><small>Received</small></div><i className="pos">+$120.00</i></div>
            <div className="pw-tx"><span className="dot dn" /><div><b>@john_doe</b><small>Sent</small></div><i>-$50.00</i></div>
            <div className="pw-tx"><span className="dot dn" /><div><b>@techguy</b><small>Sent</small></div><i>-$25.00</i></div>
            <small className="pw-ex">Example preview</small>
          </div>
        </section>
      </div>

      <section id="how" className="pw-sec">
        <div className="pw-wrap">
          <h2>How it works</h2>
          <div className="pw-grid3">
            {steps.map((s) => (
              <div className="pw-card" key={s.n}><span className="pw-num">{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="pw-sec">
        <div className="pw-wrap">
          <h2>Why Payworld</h2>
          <div className="pw-grid4">
            {feats.map((f) => (
              <div className="pw-card" key={f.t}><h3>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="arc" className="pw-sec">
        <div className="pw-wrap">
          <div className="pw-card pw-arc">
            <h2>Built on Arc</h2>
            <p>Arc is Circle&apos;s EVM-compatible blockchain designed for stablecoin payments, with gas paid in USDC. Payworld uses it to move USDC and EURC quickly and cheaply.</p>
          </div>
        </div>
      </section>

      <section className="pw-sec">
        <div className="pw-wrap">
          <div className="pw-final">
            <h2>Start sending today</h2>
            <p>Create your account in under a minute.</p>
            <a className="pw-btn gold" href="/login">Open Payworld</a>
          </div>
          <footer className="pw-foot"><span>© Payworld</span><span>Built on Arc</span></footer>
        </div>
      </section>
    </main>
  );
}
