import plugin from "tailwindcss/plugin";

const gridColumns = 12;
const gridGutterWidth = "1.5rem";
const gridGutters = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "1rem",
  4: "1.5rem",
  5: "3rem",
};

const columns = Array.from({ length: gridColumns }, (_, index) => index + 1);
const rowColsSteps = columns.slice(0, Math.floor(gridColumns / 2));

export default plugin.withOptions(() => {
  return ({ addComponents }) => {
    const respectImportant = true;

    addComponents(
      {
        ".row": {
          "--bs-gutter-x": gridGutterWidth,
          "--bs-gutter-y": 0,
          display: "flex",
          flexWrap: "wrap",
          marginTop: "calc(var(--bs-gutter-y) * -1)",
          marginRight: "calc(var(--bs-gutter-x) / -2)",
          marginLeft: "calc(var(--bs-gutter-x) / -2)",
          "& > *": {
            boxSizing: "border-box",
            flexShrink: 0,
            width: "100%",
            maxWidth: "100%",
            paddingRight: "calc(var(--bs-gutter-x) / 2)",
            paddingLeft: "calc(var(--bs-gutter-x) / 2)",
            marginTop: "var(--bs-gutter-y)",
          },
        },
      },
      { respectImportant },
    );

    addComponents(
      [
        {
          ".col": { flex: "1 0 0%" },
          ".row-cols-auto": { "& > *": { flex: "0 0 auto", width: "auto" } },
        },
        ...rowColsSteps.map((count) => ({
          [`.row-cols-${count}`]: {
            "& > *": { flex: "0 0 auto", width: `${100 / count}%` },
          },
        })),
        { ".col-auto": { flex: "0 0 auto", width: "auto" } },
        ...columns.map((count) => ({
          [`.col-${count}`]: {
            flex: "0 0 auto",
            width: `${(100 / gridColumns) * count}%`,
          },
        })),
      ],
      { respectImportant },
    );

    addComponents(
      [0, ...columns.slice(0, -1)].map((count) => ({
        [`.offset-${count}`]: { marginLeft: `${(100 / gridColumns) * count}%` },
      })),
      { respectImportant },
    );

    if (Object.keys(gridGutters).length > 0) {
      const gutterComponents = Object.entries(gridGutters).reduce(
        (accumulator, [key, value]) => {
          accumulator[`.g-${key}`] = {
            "--bs-gutter-x": value,
            "--bs-gutter-y": value,
          };
          accumulator[`.gx-${key}`] = { "--bs-gutter-x": value };
          accumulator[`.gy-${key}`] = { "--bs-gutter-y": value };
          return accumulator;
        },
        {},
      );
      addComponents(gutterComponents, { respectImportant });
    }

    addComponents(
      [
        {
          ".order-first": { order: "-1" },
          ".order-last": { order: gridColumns + 1 },
        },
        ...[0, ...columns].map((count) => ({
          [`.order-${count}`]: { order: String(count) },
        })),
      ],
      { respectImportant },
    );
  };
});
