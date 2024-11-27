import { dataSchemaModifier } from "./data-schema-modifier";
import { data } from "./data-schema-modifier.fixture";

describe("dataSchemaModifier", () => {
  const modifiers = {
    uppercase: (value: string) => value.toUpperCase(),
    dateBr: (value: string) => value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1"),
    addDots: (value: string) => value.split("").join("."),
  };

  describe("when schema or data are invalids", () => {
    const table = [null, undefined, "", 0, false, true, [], {}];
    it.each(table)("should return %p if schema is %p", (value) => {
      expect(dataSchemaModifier(data, value)).toEqual(value);
    });

    it.each(table)("should return a schema if data is %p", (value) => {
      const schema = { name: "{{ firstName  }}" };
      expect(dataSchemaModifier(value, schema)).toEqual(schema);
    });
  });

  describe("when schema contains a simple object interpolation", () => {
    it("should transpile a simple schema interpolation", () => {
      const schema = { name: "{{firstName}}" };
      expect(dataSchemaModifier(data, schema)).toEqual({ name: "Ricardo" });
    });

    it("should transpile string schema interpolation with spaces", () => {
      const schema = { name: "{{ firstName  }}" };
      expect(dataSchemaModifier(data, schema)).toEqual({ name: "Ricardo" });
    });

    it("should return transpiled schema with static values", () => {
      const schema = { title: "Usuário", name: "{{ firstName }}" };
      expect(dataSchemaModifier(data, schema)).toEqual({
        title: "Usuário",
        name: "Ricardo",
      });
    });

    it("should transpile schemas with deep interpolation", () => {
      const schema1 = { job: "{{ job.title }}" };
      expect(dataSchemaModifier(data, schema1)).toEqual({ job: "Developer" });

      const schema2 = { company: "{{ job.company.name }}" };
      expect(dataSchemaModifier(data, schema2)).toEqual({
        company: "Me Salva!",
      });
    });

    it.each(["{{invalidKey}}", "{{job.invalidKey}}", "{{job.progress.date}}"])(
      "should return the same schema when not has data to interpolate",
      (key) => {
        const schema = { key };
        expect(dataSchemaModifier(data, schema)).toEqual(schema);
      }
    );

    it.each`
      type       | schema                          | result
      ${"false"} | ${{ isSingle: "{{isSingle}}" }} | ${{ isSingle: false }}
      ${"zero"}  | ${{ faults: "{{faults}}" }}     | ${{ faults: 0 }}
      ${"null"}  | ${{ more: "{{more}}" }}         | ${{ more: null }}
    `("should transpile schema with data value is $type", ({ schema, result }) => {
      expect(dataSchemaModifier(data, schema)).toEqual(result);
    });
  });

  describe("when schema is an deep object", () => {
    it("should transpile a deep object schema", () => {
      const schema = { user: { name: "{{firstName}}" } };
      expect(dataSchemaModifier(data, schema)).toEqual({
        user: { name: "Ricardo" },
      });
    });
  });

  describe("when schema contains concatenated interpolations", () => {
    it("should transpile concatenated interpolations", () => {
      const schema = { name: "{{firstName}} {{lastName}}" };
      expect(dataSchemaModifier(data, schema)).toEqual({
        name: "Ricardo Fredes",
      });
    });

    it("should transpile concatenated interpolations", () => {
      const schema = { address: "{{address.city}}/{{address.state}}" };
      expect(dataSchemaModifier(data, schema)).toEqual({
        address: "Porto Alegre/RS",
      });
    });

    it("should transpile concatenated interpolations", () => {
      const schema = "{{firstName}} has a {{faults}} faults";
      expect(dataSchemaModifier(data, schema)).toEqual("Ricardo has a 0 faults");
    });
  });

  describe("when schema is an array", () => {
    it("should return an array", () => {
      const schema = [{ name: "{{firstName}}" }];
      expect(dataSchemaModifier(data, schema)).toEqual([{ name: "Ricardo" }]);
    });
  });

  describe("when schema contains a modifiers", () => {
    it("should apply a modifier", () => {
      const schema = { name: "{{firstName|uppercase}}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "RICARDO",
      });
    });

    it("should apply a modifier if schema contains extra spaces", () => {
      const schema = { name: "{{firstName |  uppercase }}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "RICARDO",
      });
    });

    it("should DON'T apply a modifier if there are not correspondent key", () => {
      const schema = { name: "{{firstName |  invalidModifierKey }}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "Ricardo",
      });
    });

    it("should DON'T apply a modifier if it throws error", () => {
      const modifiers = {
        throwError: (_value: any) => {
          throw new Error("Error");
        },
      };
      const schema = { name: "{{ firstName | throwError }}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "Ricardo",
      });
    });

    it("should DON'T apply a modifier if it throws error", () => {
      const schema = { isSingle: "{{ isSingle | uppercase }}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        isSingle: false,
      });
    });

    it("should apply more than one modifier", () => {
      const schema = { name: "{{firstName|uppercase|addDots}}" };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "R.I.C.A.R.D.O",
      });
    });

    it("should apply modifiers", () => {
      const schema = {
        name: "{{firstName|uppercase}}",
        birthDate: "{{birthDate|dateBr}}",
      };
      expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
        name: "RICARDO",
        birthDate: "31/12/3001",
      });
    });
  });

  describe("when schema contains an array interpolation", () => {
    it("should return a value if schema reference an element from array", () => {
      expect(dataSchemaModifier(data, { hobby: "{{hobbies[0]}}" })).toEqual({
        hobby: "programming",
      });
    });

    it("should don't interpolate invalid array key", () => {
      const schema = { hobby: "{{hobbies[5]}}" };
      expect(dataSchemaModifier(data, schema)).toEqual(schema);
    });

    it("should return concatenated values", () => {
      const schema1 = { hobby: "{{hobbies[0]}} {{hobbies[1]}}" };
      expect(dataSchemaModifier(data, schema1)).toEqual({
        hobby: "programming reading",
      });

      const schema2 = { hobby: "{{ hobbies[0]}}, {{hobbies[1] }}." };
      expect(dataSchemaModifier(data, schema2)).toEqual({
        hobby: "programming, reading.",
      });
    });

    it("should return concatenated values with modifiers", () => {
      const schema1 = {
        hobby: "{{hobbies[0]|uppercase}} {{hobbies[1]|uppercase}}",
      };
      expect(dataSchemaModifier(data, schema1, modifiers)).toEqual({
        hobby: "PROGRAMMING READING",
      });
    });

    it("should return a same data array from interpolated schema", () => {
      const expected = { hobbies: ["programming", "reading", "running"] };
      const schema1 = { hobbies: "{{hobbies}}" };
      const schema2 = { hobbies: "{{hobbies[*]}}" };
      expect(dataSchemaModifier(data, schema1)).toEqual(expected);
      expect(dataSchemaModifier(data, schema2)).toEqual(expected);
    });

    it("should return a new array from interpolated schema", () => {
      const schema = { courses: "{{courses[*].name}}" };
      expect(dataSchemaModifier(data, schema)).toEqual({
        courses: ["JavaScript", "React", "NodeJS"],
      });
    });

    it("should return a empty array if there is not data key", () => {
      const schema = { courses: "{{courses[*].invalidKey}}" };
      expect(dataSchemaModifier(data, schema)).toEqual({
        courses: [],
      });
    });

    it("should return a new array from interpolated schema ARRAY", () => {
      const schema = { courses: ["{{courses}}", { name: "{{name}}" }] };
      expect(dataSchemaModifier(data, schema)).toEqual({
        courses: [{ name: "JavaScript" }, { name: "React" }, { name: "NodeJS" }],
      });
    });

    it("should interpolate a Array if key has spaces", () => {
      const schema = { courses: ["{{ courses }}", { name: "{{name}}" }] };
      expect(dataSchemaModifier(data, schema)).toEqual({
        courses: [{ name: "JavaScript" }, { name: "React" }, { name: "NodeJS" }],
      });
    });

    it("should return a same schema array if there is not interpolation", () => {
      const schema = { courses: ["element1", "element2"] };
      expect(dataSchemaModifier(data, schema)).toEqual(schema);
    });

    it("should return a empty array if there is not data key array", () => {
      const schema = { courses: ["{{invalidKey}}", { name: "{{name}}" }] };
      expect(dataSchemaModifier(data, schema)).toEqual({ courses: [] });
    });

    it("should return a empty array if data key is nota an array", () => {
      const schema = { courses: ["{{job}}", { name: "{{name}}" }] };
      expect(dataSchemaModifier(data, schema)).toEqual({ courses: [] });
    });

    it("should return a new array", () => {
      const schema = { courses: ["{{courses[*]}}", { name: "{{name}}" }] };
      expect(dataSchemaModifier(data, schema)).toEqual({
        courses: [{ name: "JavaScript" }, { name: "React" }, { name: "NodeJS" }],
      });
    });

    it("should return default value if array is empty", () => {
      const schema = {
        courses: ["{{invalid_courses}}", { name: "{{name}}" }, { name: "default_name" }],
      };
      expect(dataSchemaModifier(data, schema)).toEqual({ courses: [{ name: "default_name" }] });
    });

    describe("When schema has others values", () => {
      it("should NOT interpolate constant values", () => {
        const schema = {
          number: 10,
          string: "string",
          object: {},
          boolean: true,
          null: null,
          undefined: undefined,
        };
        expect(dataSchemaModifier(data, schema)).toEqual(schema);
      });
    });

    describe("when schema is complex", () => {
      it("should interpolate complex schema", () => {
        const schema = {
          platform: {
            name: "Me Salva!",
            user: {
              name: "{{ firstName }} {{ lastName }}",
              birthDate: "{{ birthDate | dateBr }}",
            },
            hobbies: "{{ hobbies }}",
            job: "{{ job.title }} at {{ job.company.name | uppercase }}/{{ job.company.group }}",
            courses: ["{{courses}}", "{{name}} - {{duration}}"],
            kids: [
              "{{kids}}",
              {
                name: "{{name}}",
                hobbies: "{{hobbies[0]}} e {{hobbies[1]}}",
                vaccines: ["{{vaccines}}", { vaccine: "{{ name }} - {{date | dateBr}}" }],
              },
            ],
          },
        };
        expect(dataSchemaModifier(data, schema, modifiers)).toEqual({
          platform: {
            courses: ["JavaScript - 4 meses", "React - 2 meses", "NodeJS - 2 meses"],
            hobbies: ["programming", "reading", "running"],
            job: "Developer at ME SALVA!/Arco",
            kids: [
              {
                hobbies: "painting e cooking",
                name: "Lauren",
                vaccines: [{ vaccine: "Polio - 01/01/2020" }, { vaccine: "Sarampo - 01/01/2020" }],
              },
            ],
            name: "Me Salva!",
            user: { birthDate: "31/12/3001", name: "Ricardo Fredes" },
          },
        });
      });

      it("should interpolate arrays in arrays", () => {
        const schema = [
          "{{courses}}",
          {
            name: "{{name}}",
            dependencies: ["{{dependencies}}", { name: "{{name}}" }],
          },
        ];
        expect(dataSchemaModifier(data, schema, modifiers)).toEqual([
          {
            dependencies: [{ name: "Lógica de programação" }, { name: "HTML" }, { name: "CSS" }],
            name: "JavaScript",
          },
          { dependencies: [{ name: "JavaScript" }], name: "React" },
          { dependencies: [{ name: "JavaScript" }], name: "NodeJS" },
        ]);
      });
    });
  });
});
