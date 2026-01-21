export class RGBError extends Error {
  constructor(message: string) {
    super(`RGBError: ${message}`);
  }
}

export class Colour {
  #red: number;
  #green: number;
  #blue: number;
  #bold = false;
  #italic = false;
  #underline = false;
  #strikethrough = false;
  #dim = false;
  #inverse = false;
  #hidden = false;

  get redValue() {
    return this.#red;
  }

  get greenValue() {
    return this.#green;
  }

  get blueValue() {
    return this.#blue;
  }

  get boldValue() {
    return this.#bold;
  }

  get italicValue() {
    return this.#italic;
  }

  get underlineValue() {
    return this.#underline;
  }

  get strikethroughValue() {
    return this.#strikethrough;
  }

  get dimValue() {
    return this.#dim;
  }

  get inverseValue() {
    return this.#inverse;
  }

  get hiddenValue() {
    return this.#hidden;
  }

  get bold() {
    this.#bold = true;
    return this;
  }

  get italic() {
    this.#italic = true;
    return this;
  }

  get underline() {
    this.#underline = true;
    return this;
  }

  get strikethrough() {
    this.#strikethrough = true;
    return this;
  }

  get dim() {
    this.#dim = true;
    return this;
  }

  get inverse() {
    this.#inverse = true;
    return this;
  }

  get hidden() {
    this.#hidden = true;
    return this;
  }

  static rgb(red: number, green: number, blue: number) {
    return new Colour(red, green, blue);
  }

  private constructor(red: number, green: number, blue: number) {
    if (red > 255 || red < 0) throw new RGBError(`Red channel out of range`);
    if (green > 255 || green < 0) throw new RGBError(`Green channel out of range`);
    if (blue > 255 || blue < 0) throw new RGBError(`Blue channel out of range`);
    this.#red = red;
    this.#green = green;
    this.#blue = blue;
  }
}

export interface Palette {
  header: Colour;
  context: Colour;
  time: Colour;
  background?: Colour;
  log: Colour;
  info: Colour;
  error: Colour;
  warn: Colour;
  debug: Colour;
  verbose: Colour;
  fatal: Colour;
}

export const defaultPalette: Palette = {
  header: Colour.rgb(140, 194, 101).bold,
  context: Colour.rgb(209, 143, 82),
  time: Colour.rgb(215, 218, 224),
  log: Colour.rgb(140, 194, 101),
  info: Colour.rgb(74, 165, 240),
  error: Colour.rgb(228, 102, 113), // 228, 102, 113
  warn: Colour.rgb(233, 107, 79),
  debug: Colour.rgb(187, 154, 247),
  verbose: Colour.rgb(66, 179, 194),
  fatal: Colour.rgb(255, 97, 110).bold,
};

export const defaultPalette2: Palette = {
  header: Colour.rgb(38, 162, 105).bold,
  context: Colour.rgb(162, 115, 76),
  time: Colour.rgb(255, 255, 255),
  log: Colour.rgb(38, 162, 105),
  info: Colour.rgb(18, 72, 139),
  error: Colour.rgb(192, 28, 40), // 228, 102, 113
  warn: Colour.rgb(227, 71, 37),
  debug: Colour.rgb(187, 154, 247),
  verbose: Colour.rgb(42, 161, 179),
  fatal: Colour.rgb(192, 28, 40).bold,
};
