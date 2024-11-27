# Me Salva! JSON Schema Transpiler

![License](https://img.shields.io/static/v1?label=Licence&message=MIT&color=yellow)
![Coverage](https://img.shields.io/static/v1?label=Coverage&message=100%&color=lemon)
![Build](https://img.shields.io/static/v1?label=Build&message=Success&color=lemon)
![Version](https://img.shields.io/static/v1?label=Version&message=1.5.0&color=orange)

![JST](https://static.wixstatic.com/media/fb4ae7_9aec879a3605406590d26b71e1ded898~mv2.jpg/v1/fill/w_640,h_250,al_c,q_90/fb4ae7_9aec879a3605406590d26b71e1ded898~mv2.jpg)

<a name="sobre"></a>

O __JSON Schema Transpiler (JST)__ é um biblioteca criada com o intuito de interpolar valores externos (`data`) de acordo com um esquema de dados (`schema`). Ela nasceu da necessidade de serializar os dados provisionados por API externas, de modo que sejam colocados em um formato de fácil utilização no front-end. Além disso, a biblioteca foi planejada para receber plugins que ajudem a formatar os valores, ou seja, é possível converter formatos de data, moedas entre outros, bastando fornecer essa lista de modificadores (`modifiers`) para o JST.

# Tabela de Conteúdo <a name="tabela-de-conteudo"></a>

- [Sobre](#sobre)
- [Tabela de Conteúdo](#tabela-de-conteudo)
- [Instalação](#instalacao)
- [Pré-requisitos](pre-requisitos)
- [Como usar](#como-usar)
- [Testes](#testes)
- [Publicação](#publicacao)
- [Tecnologias](#tecnologias)

# Instalação <a name="instalacao"></a>

Para adicionar o JST ao seu projeto, rode o seguinte comando:

```bash
$ yarn add @andrevantunes/json-schema-transpiler
```

Agora você pode importar a lib no seu projeto. Segue abaixo um exemplo simples de uso:

```js
const jsonSchemaTranspiler = require("@andrevantunes/json-schema-transpiler");

const data = { user: { name: "André" }, job: { title: "Developer" } };
const schema = { title: "{{user.name}}", subtitle: "{{job.title}}" };
const output = jsonSchemaTranspiler(data, schema);

// output
{
  title: "André",
  subtitle: "Developer",
}

```

# Pré-requisitos <a name="pre-requisitos"></a>

- Git
- Node.js >= 14 <= 16 (Recomendado)
- Yarn >= 1 <= 2

## Os seguintes padrões foram adotados e devem ser seguidos:

- [Conventional Commits](https://www.conventionalcommits.org/)
- TDD

# Como usar <a name="como-usar"></a>

Para os exemplos de uso à seguir, vamos usar como base o seguinte exemplo de dados:

```js
// data-mock.js
const data = {
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
    },
    {
      name: "React",
      duration: "2 meses",
    },
    {
      name: "NodeJS",
      duration: "2 meses",
    },
  ],
};

module.exports = { data }
```

## JSON Schema Transpiler (JST)

A seguir segue um trecho de código servirá como base para os nossos próximos exemplos:

```js
// index.js
const jsonSchemaTranspiler = require("@andrevantunes/json-schema-transpiler");
const { data } = require("./data-mock");

const schema = {};
const modifiers = undefined; // opcional

const result = jsonSchemaTranspiler(data, schema, modifiers);
```

Cada elemento será explicado a seguir:
- data
- schema
- modifiers

## Data

É um objeto que servirá como fonte de dados para o `JST` buscar os valores solicitados via `schema`. Geralmente esses dados são provisionados via API e será convertidos em um formato novo de dados que seja compatível com o formato de uso dentro de um componente ou função.

## Schema

O `schema` é um modelo de como o dado deverá ser formato. Os valores deverão ser acessados dentro uma `string` seguindo o seguinte padrão: `{{ DATA_KEY }}`. Veja o exemplo à seguir:

```js
// index.js
...
const schema = {
  name: "{{firstName}}",
  job: "{{job.title}}",
  company: "{{job.company.name}}",
};

const result = jsonSchemaTranspiler(data, schema);

// output
{
  name: "Ricardo",
  job: "Developer",
  company: "Me Salva!",
}

```

Note que é possível acessar os dados de dentro do objeto usando o `.`!
O uso de espaço dentro das chaves não interfere no resultado, portanto esses dois formatos são válidos:

```js
"{{firstName}}"
// ou
"{{ firstName }}"
```

Também é possível concatenar valores dentro de uma mesma `string`:

```js
// index.js
...
const schema = {
  title: "Usuário",
  name: "{{firstName}} {{lastName}}",
  from: "{{address.city}} - {{address.state}}",
};

const result = jsonSchemaTranspiler(data, schema);

// output
{
  title: "Usuário",
  name: "Ricardo Fredes",
  from: "Porto Alegre - RS",
}

```

Note também que um valor repassado para o schema como invariável `title`, é devolvido no resultado da mesma forma.

## Modificadores

O `JST` pode receber um objeto com uma lista de modificadores, que podem converter os dados interpolados em outro formato. Isso pode ser muito útil para trabalhar com datas, moedas e textos. Para isso basta fornecer essa lista no seguinte formato:

```ts
export type Modifier = (data: any) => any;
export type ModifierList = Record<string, Modifier>;
```

Para interpolar os valores e aplicar o modificador, dentro das chaves use o separador `|`.
Veja um exemplo de uso:

```js
// index.js
...

const modifiers = {
  toUpperCase: (value: string) => value.toUpperCase(),
  formatDate: (value: string) => value.replace(/(\d{4})-(\d{2})-(\d{2})/g, "$3/$2/$1"),
  separateByDots: (value: string) => value.replace(/./g, "$&."),
};

const schema = {
  name: "{{firstName|toUpperCase}} {{lastName|toUpperCase}}",
  birthDate: "{{birthDate|formatDate}}",
};

const result = jsonSchemaTranspiler(data, schema, modifiers);

// output
{
  name: "RICARDO FREDES",
  birthDate: "31/12/3001",
}
```

Mais uma vez os espaços não alteram o uso, portanto as duas formas são válidas:

```js
"{{firstName|toUpperCase}}"
// ou
"{{ firstName | toUpperCase }}"
```

No exemplo à seguir vamos mostrar como encadear dois ou mais modificadores:

```js
// index.js
...
// modifiers
...

const schema = { name: "{{ firstName | toUpperCase | separateByDots }}" };

const result = jsonSchemaTranspiler(data, schema, modifiers);

// output
{
  name: "R.I.C.A.R.D.O.",
}
```

## Arrays

Para formatar `array` é necessário que tanto o `schema` como valor alvo dentro do `data` sejam do mesmo tipo: `array`. Para interpolar um `array`, usamos a seguinte nomenclatura: `DATA_KEY[*]`. Para uma interpolação mais avançada é possível usar um sub-schema, o que será apresentado mais à frente. Veja um exemplo mais simples:

```js
// index.js
...

const schema = { courses: "{{courses[*]}}" };
// Teremos o mesmo resultado se fosse declarado sem "[*]"
// const schema = { courses: "{{courses}}" };

const result = jsonSchemaTranspiler(data, schema);

// output
{
  courses: [
    {
      name: "JavaScript",
      duration: "4 meses",
    },
    {
      name: "React",
      duration: "2 meses",
    },
    {
      name: "NodeJS",
      duration: "2 meses",
    },
  ],
}
```

Neste próximo exemplo vamos utilizar o método de interpolar um valor específico de dentro de um elemento do `array`:

```js
// index.js
...

const schema = { courses: "{{courses[*].name}}" };

const result = jsonSchemaTranspiler(data, schema);

// output
{ courses: ["JavaScript", "React", "NodeJS"] }

```

Em caso de erro o valor retornado será o de um `array` vazio `[]`.

A seguir teremos um exemplo avançado, em que o `array` a ser interpolado terá um sub-schema. o padrão utilizado para isso é de ter um array com dois elementos, sendo o primeiro uma interpolação da chave referente ao `data` e o segundo elemento um sub-schema. Veja o exemplo à seguir:

```js
// index.js
...

// [datakey, subSchema]
const schema = { courses: ["courses[*]", { name: "{{name}}" }] };

const result = jsonSchemaTranspiler(data, schema);

// output
{ courses: [{ name: "JavaScript" }, { name: "React" }, { name: "NodeJS" }] }

```

Dá mesma forma como foi mostrado anteriormente, o sub-schema segue as mesmas regras do `schema`:

```js
// index.js
...
// note que o uso do "[*]" é facultativo
const schema = { courses: [ "{{courses}}", "{{name}} - {{duration}}"] };

const result = jsonSchemaTranspiler(data, schema);

// output
{ courses: ["JavaScript - 4 meses", "React - 2 meses", "NodeJS - 2 meses"] }

```

Além disso segue mais um exemplo com o uso de modificadores:

```js
// index.js
...
// modifiers
...

const schema = { courses: ["courses[*]", "{{name | toUpperCase}}"] };

const result = jsonSchemaTranspiler(data, schema, modifiers);

// output
{ courses: ["JAVASCRIPT", "REACT", "NODEJS"] }

```

# Testes <a name="testes"></a> 

Essa lib foi construída seguindo a metodologia de TDD. Para rodar os testes basta rodar os seguintes comandos:

```bash
# Rodando os testes
$ yarn test

# Rodando os testes com watch
$ yarn test:watch

# Rodando os testes com coverage
$ yarn test:coverage
```

![image](https://user-images.githubusercontent.com/29892001/163472052-6047604c-7699-4ae0-be7f-cdb1f805e3b7.png)

# Publicação <a name="publicacao"></a>

Esse projeto utiliza o Git flow e o semantic release para tipagem dos commits, portanto, todas as branches de trabalho devem ser criadas à partir da `develop`. Após o PR aberto, revisado e mesclado para a `develop`, é necessário abrir um outro PR de `develop` para `main` com o nome `ci: develop into main`. Assim que esse último for mesclado na `main`, o processo de publicação será realizado automaticamente. Uma nova versão e tag serão geradas com base no semantic release.

# Tecnologias <a name="tecnologias"></a>

- [Jest](https://jestjs.io/pt-BR/)
- [Node.js](https://nodejs.org/en/)
- [Semantic Release](https://www.npmjs.com/package/semantic-release)
- [Typescript](https://www.typescriptlang.org/)
# json-schema-transpiler
