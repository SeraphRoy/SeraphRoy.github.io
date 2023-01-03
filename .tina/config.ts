import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "master";

export default defineConfig({
  branch,
  clientId: "bc110308-ca8c-4eed-bb04-ae0403bc5a9e", // Get this from tina.io
  token: "29bb707d99c0455f1fa064b06e6816828b8fe347", // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "/",
  },
  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "/",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "_posts",
        format: "md",
        ui: {
          defaultItem: () => {
            return {
              // When a new post is created the layout field will be set to "post"
              layout: 'post',
              author: 'Yanxi Chen',
              date: new Date().toISOString(),
              mathjax: true,
            }
          },
          filename: {
            readonly: false,
            slugify: values => {
              const date = new Date();
              const day = date.getDate();
              const month = date.getMonth() + 1;
              const year = date.getFullYear();

              const currentDate = `${year}-${month}-${day}`;

              return `${currentDate}-${values?.title?.replace(/ /g, '-')}`
            },
          }
        },
        fields: [
          {
            type: "string",
            name: "layout",
            label: "Layout",
          },
          { 
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          { 
            type: "datetime",
            name: "date",
            label: "Date",
          },
          { 
            type: "string",
            name: "categories",
            label: "Categories",
            list: true,
          },
          { 
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          { 
            type: "string",
            name: "author",
            label: "Author",
          },
          { 
            type: "boolean",
            name: "mathjax",
            label: "Mathjax",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            templates: [
              {
                name: 'More',
                label: 'More',
                match: {
                  start: '<!--',
                  end: '-->',
                },
                fields: [
                  {
                    // Be sure to call this field `text`
                    name: 'text',
                    label: 'Text',
                    type: 'string',
                  },
                ],
              },
            ]
          },
        ],
      },
    ],
  },
});
