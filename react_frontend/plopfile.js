export default function (plop) {
  plop.setGenerator('feature', {
    description: '生成一个标准的前端业务特性模块 (Feature)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '请输入模块名称 (例如: userProfile, dataExport):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{camelCase name}}/pages/{{pascalCase name}}Page.tsx',
        templateFile: 'plop-templates/feature/Page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase name}}/services/{{camelCase name}}Api.ts',
        templateFile: 'plop-templates/feature/service.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase name}}/hooks/use{{pascalCase name}}.ts',
        templateFile: 'plop-templates/feature/hook.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase name}}/schemas/{{camelCase name}}Schema.ts',
        templateFile: 'plop-templates/feature/schema.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase name}}/index.ts',
        templateFile: 'plop-templates/feature/index.ts.hbs',
      },
    ],
  })
}
