export default function App() {
  return (
    <>
      <header className="site-header">
        <h1 className="logo">Itinera</h1>
        <button className="btn btn-primary" type="button">
          New trip
        </button>
      </header>

      <main className="container">
        <section className="trips" aria-labelledby="trips-heading">
          <h2 id="trips-heading">My trips</h2>

          <ul className="trip-list">
            {/* Placeholder card; trips will be rendered from state in a later step */}
            <li className="trip-card">
              <h3>Example trip</h3>
              <p>Destination · Dates</p>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
