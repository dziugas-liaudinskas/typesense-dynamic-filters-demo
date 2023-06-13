import {
  Configure,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
} from 'react-instantsearch-hooks-web';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import Filters from './Filters';

import type { Hit } from 'instantsearch.js';

import './App.css';

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "8hLCPSQTYcBuK29zY5q6Xhin7ONxHy99", // Be sure to use the search-only-api-key
    nodes: [
      {
        host: "qtg5aekc2iosjh93p.a1.typesense.net",
        port: 443,
        protocol: "https"
      }
    ]
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  queryBy is required.
  additionalSearchParameters: {
    query_by: "name,categories,description"
  }
});
const typesenseSearchClient = typesenseInstantsearchAdapter.searchClient;


export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">typesense-instantsearch-demo</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch-hooks-web">
            React InstantSearch Hooks
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch searchClient={typesenseSearchClient} indexName="products" >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Filters />
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <Hits hitComponent={Hit} />

              <div className="pagination">
                <Pagination />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitProps = {
  hit: Hit;
};

function Hit({ hit }: HitProps) {
  return (
    <article>
      <h2>{hit.price}$ - {hit.name}</h2>
      <p>{hit.description}</p>
    </article>
  );
}
