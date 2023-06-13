import { useCallback } from 'react';
import { useDynamicWidgets, RefinementList } from 'react-instantsearch-hooks-web';

import { PriceFilter } from './PriceFilter';

const FallbackComponent = ({ attribute}:{ attribute: string }) => {
  return <>
    <h3>{attribute}</h3>
    <RefinementList attribute={attribute} />
    </>;
};

export default function Filters() {
  const { attributesToRender } = useDynamicWidgets({ facets: [`*`] });

  const DynamicWidgetComponent = useCallback(
    ({ attribute }: { attribute: string }) => {
      // @ts-ignore
      if (attribute === `price` || attribute.startsWith(`categories`)) {
        return null;
      }
      return <FallbackComponent attribute={attribute} />;
    },
    []
  );

  return (
    <div className="Filters">
      <PriceFilter
        attribute="price"
      />
      {attributesToRender.map((attribute) => {
        return (
          <DynamicWidgetComponent
            key={attribute}
            attribute={attribute}
          ></DynamicWidgetComponent>
        );
      })}
    </div>
  );
}
