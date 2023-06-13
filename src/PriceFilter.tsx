import { useState } from "react";
import type { GetHandleProps } from "react-compound-slider";
import { Slider, Rail, Handles, Tracks } from "react-compound-slider";
import { useRange } from "react-instantsearch-hooks-web";
import type {
  Range,
  RangeBoundaries,
} from "instantsearch.js/es/connectors/range/connectRange";

import "./PriceFilter.css";

function Handle({
                  domain: [min, max],
                  handle: { id, value, percent },
                  disabled,
                  getHandleProps,
                  index,
                }: {
  domain: [number, number];
  handle: { id: string; value: number; percent: number };
  disabled?: boolean;
  getHandleProps: GetHandleProps;
  index: number;
}) {
  return (
    <>
      {/* Dummy element to make the tooltip draggable */}
      <div
        style={{
          position: `absolute`,
          left: `${percent}%`,
          width: 30,
          height: 25,
          transform: `translate(-50%, -100%)`,
          cursor: disabled ? `not-allowed` : `grab`,
        }}
        aria-hidden={true}
        {...getHandleProps(id)}
      />
      <div
        role="slider"
        className="PriceFilter__slider-handle"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          left: `${percent}%`,
          cursor: disabled ? `not-allowed` : `grab`,
          zIndex: index === 0 ? 2 : 1, // min handle should be on top
        }}
        {...getHandleProps(id)}
      />
    </>
  );
}

function convertToTicks(start: RangeBoundaries, range: Range): number[] {
  const domain =
    range.min === 0 && range.max === 0
      ? { min: undefined, max: undefined }
      : range;

  return [
    start[0] === -Infinity ? domain.min! : start[0]!,
    start[1] === Infinity ? domain.max! : start[1]!,
  ];
}

function formatRangeValues(values: number[]): [number, number] {
  const minValue = values[0];
  const maxValue = values[1];
  return [minValue, maxValue];
}
export function PriceFilter({ attribute }: { attribute: string }) {
  const { range, start, refine, canRefine } = useRange(
    {
      attribute,
    },
    { $$widgetType: `e-commerce.rangeSlider` }
  );
  const [ticksValues, setTicksValues] = useState(convertToTicks(start, range)); // slider values
  // inputs values
  const [inputValues, setInputValues] = useState(
    formatRangeValues(convertToTicks(start, range))
  );
  const [prevStart, setPrevStart] = useState(start);

  if (start !== prevStart) {
    setTicksValues(convertToTicks(start, range));
    setPrevStart(start);
  }

  const onChange = (values: readonly number[]) => {
    const from = values[0];
    const to = values[1];
    refine([from, to]);
  };

  const onSliderUpdate = (values: readonly number[]) => {
    setTicksValues(values as [number, number]); // set slider values
    setInputValues(values as [number, number]); // update inputs values based on slider values
  };

  if (ticksValues[0] === undefined || ticksValues[1] === undefined) {
    return null;
  }

  const onFromInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues((prev) => {
      return [Number(event.target.value), prev[1]];
    });
  };

  const onToInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues((prev) => {
      return [prev[0], Number(event.target.value)];
    });
  };

  const domainRange = formatRangeValues([range.min!, range.max!]);

  const onFromInputBlur = () => {
    let updatedFromValue = inputValues[0]; // Values that user entered in the input
    // if the value is lower than the min possible value, set to it
    if (updatedFromValue < domainRange[0]) {
      updatedFromValue = domainRange[0];
    } else if (updatedFromValue >= ticksValues[1]) {
      // if the value is higher than the current selected "to" value - 1, set to 1 less than it
      updatedFromValue = ticksValues[1];
    }
    // if any of upper conditions were met, update the input value
    if (updatedFromValue !== inputValues[0]) {
      setInputValues([updatedFromValue, inputValues[1]]);
    }
    setTicksValues([updatedFromValue, inputValues[1]]); // update the slider values
    onChange([updatedFromValue, inputValues[1]]); // update the search
  };

  const onToInputBlur = () => {
    let updatedToValue = inputValues[1]; // Values that user entered in the input
    // if the value is higher than the max possible value, set to it
    if (updatedToValue > domainRange[1]) {
      updatedToValue = domainRange[1];
    } else if (updatedToValue <= ticksValues[0]) {
      // if the value is lower than the current selected "from" value + 1, set to 1 more than it
      updatedToValue = ticksValues[0];
    }
    // if any of upper conditions were met, update the input value
    if (updatedToValue !== inputValues[1]) {
      setInputValues([inputValues[0], updatedToValue]);
    }
    setTicksValues([inputValues[0], updatedToValue]); // update the slider values
    onChange([inputValues[0], updatedToValue]); // update the search
  };

  return (
    <div className="PriceFilter">
      <div className="Filter__header">From</div>
      <div className="PriceFilter__inputs">
        <div className="PriceFilter__input-wrapper">
          <input
            aria-label="price from"
            type="number"
            min={(domainRange[0]).toFixed(2)} // min possible value
            max={(ticksValues[1] - 1).toFixed(2)} // current "to" value - 1
            value={inputValues[0]}
            onChange={onFromInputChange}
            onBlur={onFromInputBlur}
          />
        </div>
        <span>To</span>
        <div className="PriceFilter__input-wrapper">
          <input
            aria-label="price to"
            type="number"
            min={(ticksValues[0] + 1).toFixed(2)} // current "from" value + 1
            max={(domainRange[1]).toFixed(2)} // max possible value
            value={inputValues[1]}
            onChange={onToInputChange}
            onBlur={onToInputBlur}
          />
        </div>
      </div>
      <Slider
        mode={2}
        step={1}
        domain={domainRange}
        values={start as number[]}
        disabled={!canRefine}
        onChange={onChange}
        onUpdate={onSliderUpdate}
        rootStyle={{
          position: `relative`,
          paddingTop: `12px`,
          paddingBottom: `28px`,
        }}
        className="PriceFilter__slider"
      >
        <Rail>
          {({ getRailProps }) => {
            return (
              <div className="PriceFilter__slider-rail" {...getRailProps()} />
            );
          }}
        </Rail>

        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => {
            return (
              <div>
                {tracks.map(({ id, source, target }) => {
                  return (
                    <div
                      key={id}
                      className="PriceFilter__slider-track"
                      style={{
                        left: `${source.percent}%`,
                        width: `${target.percent - source.percent}%`,
                      }}
                      {...getTrackProps()}
                    />
                  );
                })}
              </div>
            );
          }}
        </Tracks>

        <Handles>
          {({ handles, getHandleProps }) => {
            return (
              <div>
                {handles.map((handle, index) => {
                  return (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={domainRange}
                      getHandleProps={getHandleProps}
                      index={index}
                    />
                  );
                })}
              </div>
            );
          }}
        </Handles>
      </Slider>
    </div>
  );
}
