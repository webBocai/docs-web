import markdownItContainer from 'markdown-it-container';
import { default as MarkdownIt } from 'markdown-it';

type StrType = 'list-info' | 'list-warning' | 'list-danger' | 'list-success' | 'list-tip' | 'list-default';

export const ListLabel = (md: MarkdownIt) => {
  md.use(markdownItContainer, 'listLabel', {
    validate: function (params: string) {
      const types = ['list-info', 'list-warning', 'list-danger', 'list-success', 'list-tip', 'list-default'];
      const type = params.trim().split(' ')[0];
      return types.includes(type);
    },

    render: function (tokens: any, idx: number) {
      const token = tokens[idx];
      const params = token.info.trim().split(' ');
      const type: StrType = (params[0] as StrType) || 'list-default';
      const text = params.slice(1).join(' ') || '默认标题';

      // 提取类型后缀（去掉 "list-" 前缀）
      const typeSuffix = type.replace('list-', '');

      if (token.nesting === 1) {
        // 添加折叠功能 - 使用 details 和 summary 标签
        return `
        <details class="custom-list-block list-block-${typeSuffix}" open>
          <summary class="list-block-title">${text}</summary>
          <div class="list-block-content">
        `;
      } else {
        return '</div></details>\n';
      }
    },
  });
};
