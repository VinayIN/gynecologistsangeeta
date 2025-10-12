import plugin from "tailwindcss/plugin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themePath = path.resolve(__dirname, "../../../data/theme.json");

const findFont = (fontStr = "") =>
  fontStr.replace(/\+/g, " ").replace(/:[^:]+/g, "");

const resolveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const readThemeConfig = () => {
  try {
    const raw = readFileSync(themePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      `[tailwind] Unable to load theme definition at ${themePath}: ${error.message}`,
    );
    return null;
  }
};

const buildThemeTokens = (themeConfig) => {
  if (!themeConfig) {
    return null;
  }

  const fonts = themeConfig.fonts?.font_family ?? {};
  const fontFamilies = Object.entries(fonts)
    .filter(([key]) => !key.includes("type"))
    .reduce((acc, [key, font]) => {
      const fallback = fonts[`${key}_type`] || "sans-serif";
      acc[key] = `${findFont(font)}, ${fallback}`;
      return acc;
    }, {});

  const baseSize = resolveNumber(themeConfig.fonts?.font_size?.base, 16);
  const scale = resolveNumber(themeConfig.fonts?.font_size?.scale, 1.25);

  const calculateFontSizes = () => {
    const sizes = {};
    let currentSize = scale;
    for (let i = 6; i >= 1; i -= 1) {
      sizes[`h${i}`] = `${currentSize}rem`;
      sizes[`h${i}-sm`] = `${currentSize * 0.9}rem`;
      currentSize *= scale;
    }
    sizes.base = `${baseSize}px`;
    sizes["base-sm"] = `${baseSize * 0.8}px`;
    return sizes;
  };

  const fontSizes = calculateFontSizes();

  const fontVars = Object.entries(fontSizes).reduce((acc, [key, value]) => {
    acc[`--text-${key}`] = value;
    return acc;
  }, {});

  Object.entries(fontFamilies).forEach(([key, font]) => {
    fontVars[`--font-${key}`] = font;
  });

  const collectColors = (groups) =>
    groups.reduce(
      (acc, { colors, prefix }) => {
        if (!colors) {
          return acc;
        }
        Object.entries(colors).forEach(([name, value]) => {
          const cssKey = name.replace(/_/g, "-");
          acc.vars[`--color-${prefix}${cssKey}`] = value;
          acc.map[`${prefix}${cssKey}`] = `var(--color-${prefix}${cssKey})`;
        });
        return acc;
      },
      { vars: {}, map: {} },
    );

  const defaultColorGroups = [];
  if (themeConfig.colors?.default?.theme_color) {
    defaultColorGroups.push({
      colors: themeConfig.colors.default.theme_color,
      prefix: "",
    });
  }
  if (themeConfig.colors?.default?.text_color) {
    defaultColorGroups.push({
      colors: themeConfig.colors.default.text_color,
      prefix: "",
    });
  }

  const darkColorGroups = [];
  if (themeConfig.colors?.darkmode?.theme_color) {
    darkColorGroups.push({
      colors: themeConfig.colors.darkmode.theme_color,
      prefix: "darkmode-",
    });
  }
  if (themeConfig.colors?.darkmode?.text_color) {
    darkColorGroups.push({
      colors: themeConfig.colors.darkmode.text_color,
      prefix: "darkmode-",
    });
  }

  const defaultColors = collectColors(defaultColorGroups);
  const darkColors = collectColors(darkColorGroups);

  return {
    baseVars: { ...fontVars, ...defaultColors.vars },
    darkVars: darkColors.vars,
    fontFamilies,
    fontSizes,
    colorsMap: { ...defaultColors.map, ...darkColors.map },
  };
};

export default plugin.withOptions(() => {
  const themeConfig = readThemeConfig();
  const tokens = buildThemeTokens(themeConfig);

  if (!tokens) {
    return () => {};
  }

  const { baseVars, darkVars, fontFamilies, fontSizes, colorsMap } = tokens;

  return ({ addBase, addUtilities, matchUtilities }) => {
    addBase({
      ":root": baseVars,
      ".dark": darkVars,
    });

    const fontUtils = {};
    Object.keys(fontFamilies).forEach((key) => {
      fontUtils[`.font-${key}`] = { fontFamily: `var(--font-${key})` };
    });
    Object.keys(fontSizes).forEach((key) => {
      fontUtils[`.text-${key}`] = { fontSize: `var(--text-${key})` };
    });

    addUtilities(fontUtils, {
      variants: ["responsive", "hover", "focus", "active", "disabled"],
    });

    matchUtilities(
      {
        bg: (value) => ({ backgroundColor: value }),
        text: (value) => ({ color: value }),
        border: (value) => ({ borderColor: value }),
        fill: (value) => ({ fill: value }),
        stroke: (value) => ({ stroke: value }),
      },
      { values: colorsMap, type: "color" },
    );

    matchUtilities(
      {
        from: (value) => ({
          "--tw-gradient-from": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
          "--tw-gradient-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
        }),
        to: (value) => ({
          "--tw-gradient-to": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
          "--tw-gradient-stops":
            "var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))",
        }),
        via: (value) => ({
          "--tw-gradient-via": value,
          "--tw-gradient-via-stops":
            "var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position)",
        }),
      },
      { values: colorsMap, type: "color" },
    );
  };
});
