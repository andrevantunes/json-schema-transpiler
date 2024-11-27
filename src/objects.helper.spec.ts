import { data } from "./data-schema-modifier.fixture";
import { getValueByKey } from "./objects.helper";

describe("objectsHelper", () => {
  describe("getValueByKey", () => {
    it("should return UNDEFINED if data is invalid", () => {
      expect(getValueByKey(undefined, "")).toBeUndefined();
      expect(getValueByKey(null, "")).toBeUndefined();
      expect(getValueByKey({}, "")).toBeUndefined();
      expect(getValueByKey(123, "")).toBeUndefined();
      expect(getValueByKey([], "")).toBeUndefined();
    });

    describe("when the key represent be an object key", () => {
      it("should return UNDEFINED when key if it doesn't have interpolation", () => {
        expect(getValueByKey(data, "invalidKey")).toBeUndefined();
      });

      it("should return a value", () => {
        expect(getValueByKey(data, "firstName")).toBe("Ricardo");
      });

      it.each`
        type       | key           | value
        ${"zero"}  | ${"faults"}   | ${0}
        ${"null"}  | ${"more"}     | ${null}
        ${"false"} | ${"isSingle"} | ${false}
      `("should return a value if it is a $type", ({ key, value }) => {
        expect(getValueByKey(data, key)).toBe(value);
      });

      it.each`
        key                   | value
        ${"job.title"}        | ${"Developer"}
        ${"job.company.name"} | ${"Me Salva!"}
        ${"job.progress"}     | ${null}
      `("should return a value when key is deep", ({ key, value }) => {
        expect(getValueByKey(data, key)).toBe(value);
      });

      it.each(["invalidParent.invalidKey", "invalidParent.invalidChildren.invalidKey"])(
        "should return UNDEFINED when deep key if it doesn't have interpolation",
        (key) => {
          expect(getValueByKey(data, key)).toBeUndefined();
        }
      );

      it("should return an object value", () => {
        expect(getValueByKey(data, "job")).toEqual({
          title: "Developer",
          company: {
            name: "Me Salva!",
            group: "Arco",
          },
          progress: null,
        });

        expect(getValueByKey(data, "hobbies")).toEqual(["programming", "reading", "running"]);
      });
    });

    describe("when key represent be an item from Array", () => {
      it("should return UNDEFINED if is invalid key", () => {
        expect(getValueByKey(data, "hobbies[invalidIndex]")).toBeUndefined();
      });

      it("should return a value from a specific array item", () => {
        expect(getValueByKey(data, "hobbies[0]")).toBe("programming");
      });

      it("should return UNDEFINED if there not a specific array item", () => {
        expect(getValueByKey(data, "hobbies[5]")).toBeUndefined();
      });

      it("should return UNDEFINED if there not a specific key in data", () => {
        expect(getValueByKey(data, "invalidKey[5]")).toBeUndefined();
      });

      it("should return a value from a object array", () => {
        expect(getValueByKey(data, "courses[0]")).toEqual({
          name: "JavaScript",
          duration: "4 meses",
          dependencies: [
            {
              name: "Lógica de programação",
              duration: "4 meses",
            },
            {
              name: "HTML",
              duration: "4 meses",
            },
            {
              name: "CSS",
              duration: "4 meses",
            },
          ],
        });
      });

      it("should return UNDEFINED if there not a specific deep key in data", () => {
        expect(getValueByKey(data, "courses[0].invalidKey")).toBeUndefined();
      });

      it("should return a value from a object array in deep", () => {
        expect(getValueByKey(data, "courses[0].name")).toBe("JavaScript");
      });

      it("should return a value from a deep object array in deep", () => {
        expect(getValueByKey(data, "kids[0].hobbies")).toEqual(["painting", "cooking"]);
        expect(getValueByKey(data, "kids[0].hobbies[1]")).toBe("cooking");
      });
    });

    describe("when key represent be an all [*] items from Array", () => {
      it("should return an array of values", () => {
        expect(getValueByKey(data, "hobbies[*]")).toEqual(["programming", "reading", "running"]);
      });

      it("should return an array of values from a object array", () => {
        expect(getValueByKey(data, "courses[*]")).toEqual([
          {
            name: "JavaScript",
            duration: "4 meses",
            dependencies: [
              {
                name: "Lógica de programação",
                duration: "4 meses",
              },
              {
                name: "HTML",
                duration: "4 meses",
              },
              {
                name: "CSS",
                duration: "4 meses",
              },
            ],
          },
          {
            name: "React",
            duration: "2 meses",
            dependencies: [
              {
                name: "JavaScript",
                duration: "4 meses",
              },
            ],
          },
          {
            name: "NodeJS",
            duration: "2 meses",
            dependencies: [
              {
                name: "JavaScript",
                duration: "4 meses",
              },
            ],
          },
        ]);
      });

      it("should return a empty array if deep key array is invalid", () => {
        expect(getValueByKey(data, "courses[*].invalidKey")).toEqual([]);
      });

      it("should return a specific value from deep key array", () => {
        expect(getValueByKey(data, "courses[*].name")).toEqual(["JavaScript", "React", "NodeJS"]);
        expect(getValueByKey(data, "kids[*].hobbies[1]")).toEqual(["cooking"]);
      });

      it("should return a specific value from full deep key array", () => {
        expect(getValueByKey(data, "kids[*].hobbies[*]")).toEqual([["painting", "cooking"]]);
      });

      it("should return a empty array from full deep key array if has undefined items", () => {
        expect(getValueByKey(data, "kids[*].hobbies[*].invalidKey")).toEqual([[]]);
      });

      it("should return a specific value from super full deep key array", () => {
        expect(getValueByKey(data, "kids[*].vaccines[*].name")).toEqual([["Polio", "Sarampo"]]);
      });

      it("should return a empty array from super full deep key array if has undefined items", () => {
        expect(getValueByKey(data, "kids[*].vaccines[*].invalidKey")).toEqual([[]]);
      });
    });
  });
});
