export const data = {
  firstName: "Ricardo",
  lastName: "Fredes",
  birthDate: "3001-12-31",
  isSingle: false,
  faults: 0,
  more: null,
  kids: [
    {
      name: "Lauren",
      age: "2",
      hobbies: ["painting", "cooking"],
      vaccines: [
        {
          name: "Polio",
          date: "2020-01-01",
        },
        {
          name: "Sarampo",
          date: "2020-01-01",
        },
      ],
    },
  ],
  job: {
    title: "Developer",
    progress: null,
    company: {
      name: "Me Salva!",
      group: "Arco",
    },
  },
  address: {
    street: "Rua da Tecnologia",
    number: "1234",
    neighborhood: "Centro",
    state: "RS",
    city: "Porto Alegre",
    complement: "casa",
    zipCode: "95800-000",
  },
  hobbies: ["programming", "reading", "running"],
  courses: [
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
  ],
};
