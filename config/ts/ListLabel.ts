import markdownItContainer from 'markdown-it-container';
import { default as MarkdownIt } from 'markdown-it';
type StrType = 'list-info' | 'list-warning' | 'list-danger' | 'list-success';
export const ListLabel = (md: MarkdownIt) => {
  md.use(markdownItContainer, 'listLabel', {
    // 这是一个验证函数，判断是否是您想要的容器
    validate: function (params: any) {
      // params 是 `:::` 后的字符串，例如 `listLabel warning`
      // 这里我们匹配任何以 'listLabel' 开头的容器
      const type = params.trim().split(' ')[0];
      return [
        'list-info',
        'list-warning',
        'list-danger',
        'list-success',
        'list-tip',
        'list-default',
      ].includes(type);
    },

    // 这是渲染函数，用于生成开标签和闭标签的 HTML
    render: function (tokens: any, idx: any) {
      const token = tokens[idx];

      // 解析参数，例如从 `listLabel warning` 中提取 'warning'
      const params = token.info.trim().split(' ');
      const text: StrType = params.length > 1 ? params[1] : 'xxxx';
      const type: StrType = params.length > 1 ? params[0] : 'list-default';

      // type = type ? type : 'list-info';
      const newType = type.split('list-')[1];

      // 如果是开标签（::: listLabel ...）
      if (token.nesting === 1) {
        // 返回开标签的 HTML
        // 这里我们添加一个基于类型的 class，例如 'custom-block-warning'
        return `
        <div class="list-block list-block-${newType}">
        <p class="list-block-title">${text}</p>
        <div class="list-block-content">`;
      } else {
        // 如果是闭标签（:::），直接闭合 div
        return '</div></div>\n';
      }
    },
  });
};
