import { TaskCategory, TaskPriority } from '../models/Task';

interface ClassificationKeywords {
  development: string[];
  design: string[];
  marketing: string[];
  operations: string[];
  customerSupport: string[];
  research: string[];
}

interface PriorityKeywords {
  urgent: string[];
  high: string[];
  medium: string[];
  low: string[];
}

export class AIClassifier {
  private static categoryKeywords: ClassificationKeywords = {
    development: [
      '开发', '编程', '代码', '功能', 'bug', '修复'
    ],
    design: [
      '设计', 'ui', 'ux', '界面', '原型', 'figma', 'sketch',
      'design', 'ui/ux', 'interface', 'prototype', 'mockup',
      '美观', '视觉', '配色', '字体', '图标', '动画',
      'responsive', '移动端', '适配'
    ],
    marketing: [
      '营销', '推广', '广告', '内容', 'seo', '社交媒体',
      'marketing', 'promotion', 'advertising', 'seo', 'social',
      'campaign', '用户获取', '转化率', 'a/b测试',
      '活动', '文案', '品牌', 'pr', '公众号'
    ],
    operations: [
      '运维', '部署', '监控', '日志', '服务器',
      'operations', 'devops', 'deployment', 'monitoring',
      'ci/cd', 'jenkins', 'docker', 'kubernetes',
      '性能优化', '备份', '安全', '基础设施'
    ],
    customerSupport: [
      '客服', '支持', '帮助', '反馈', 'bug',
      'support', 'help', 'feedback', 'customer',
      '投诉', '问题', '疑问', 'ticket', 'hotfix'
    ],
    research: [
      '调研', '分析', '研究', '数据', '报告',
      'research', 'analysis', 'data', 'survey',
      '竞品', '市场分析', '用户研究', '可行性'
    ]
  };

  private static priorityKeywords: PriorityKeywords = {
    urgent: [
      '紧急', '立即', '故障', '崩溃', '安全', '漏洞',
      'urgent', 'critical', 'security', 'emergency',
      'bug', 'fix', 'hotfix', '阻断', '无法使用'
    ],
    high: [
      '重要', '优先', '尽快', '里程碑', '关键',
      'high', 'important', 'priority', 'blocker',
      '功能', '上线', '截止', 'deadline'
    ],
    medium: [
      '常规', '日常', '优化', '改进',
      'medium', 'regular', 'routine', 'enhancement',
      '功能完善', '体验提升'
    ],
    low: [
      '可选', '建议', '未来', '暂缓', 'nice to have',
      'low', 'optional', 'nice-to-have', 'future',
      '文档', '整理', '重构', '美化'
    ]
  };

  private static keywordWeights = {
    title: 2.0,
    description: 1.0,
    tags: 1.5
  };

  static analyzeTask(
    title: string,
    description: string,
    tags: string[] = []
  ): {
    suggestedCategory: TaskCategory;
    suggestedPriority: TaskPriority;
    confidence: number;
    reasoning: string;
  } {
    const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

    // 分类分析
    const categoryScore = this.calculateCategoryScores(
      title.toLowerCase(),
      description.toLowerCase(),
      tags.map(t => t.toLowerCase())
    );

    // 优先级分析
    const priorityScore = this.calculatePriorityScores(
      title.toLowerCase(),
      description.toLowerCase(),
      tags.map(t => t.toLowerCase())
    );

    // 获取最高分数的分类和优先级
    const suggestedCategory = this.getTopScore(categoryScore) as TaskCategory;
    const suggestedPriority = this.getTopScore(priorityScore) as TaskPriority;

    // 计算置信度
    const categoryConfidence = categoryScore[suggestedCategory] / Object.values(categoryScore).reduce((a, b) => a + b, 0);
    const priorityConfidence = priorityScore[suggestedPriority] / Object.values(priorityScore).reduce((a, b) => a + b, 0);
    const confidence = Math.round((categoryConfidence * 0.5 + priorityConfidence * 0.5) * 100) / 100;

    // 生成推理说明
    const reasoning = this.generateReasoning(
      suggestedCategory,
      suggestedPriority,
      title,
      description
    );

    return {
      suggestedCategory,
      suggestedPriority,
      confidence,
      reasoning
    };
  }

  private static calculateCategoryScores(
    title: string,
    description: string,
    tags: string[]
  ): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;

      for (const keyword of keywords) {
        // 标题权重更高
        if (title.includes(keyword)) {
          score += this.keywordWeights.title;
        }
        if (description.includes(keyword) && !title.includes(keyword)) {
          score += this.keywordWeights.description;
        }
        // 标签匹配
        for (const tag of tags) {
          if (tag.includes(keyword)) {
            score += this.keywordWeights.tags;
          }
        }
      }

      scores[category] = score;
    }

    // 如果没有匹配关键词，根据语言默认分类
    if (Object.values(scores).every(score => score === 0)) {
      const hasChinese = /[\u4e00-\u9fa5]/.test(title + description);
      if (hasChinese) {
        scores.development += 0.1;
      } else {
        scores.development += 0.1;
      }
    }

    return scores;
  }

  private static calculatePriorityScores(
    title: string,
    description: string,
    tags: string[]
  ): Record<string, number> {
    const scores: Record<string, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const [priority, keywords] of Object.entries(this.priorityKeywords)) {
      let score = 0;

      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          score += this.keywordWeights.title;
        }
        if (description.includes(keyword) && !title.includes(keyword)) {
          score += this.keywordWeights.description;
        }
        for (const tag of tags) {
          if (tag.includes(keyword)) {
            score += this.keywordWeights.tags;
          }
        }
      }

      scores[priority] = score;
    }

    // 检查紧急词汇模式
    const urgentPatterns = ['!', '!!!', '??', '???', 'asap', 'asap!'];
    for (const pattern of urgentPatterns) {
      if (title.includes(pattern)) {
        scores.urgent += 2;
      }
    }

    // 如果没有明确优先级，默认为medium
    if (Object.values(scores).every(score => score === 0)) {
      scores.medium = 0.1;
    }

    return scores;
  }

  private static getTopScore(scores: Record<string, number>): string {
    let maxScore = -1;
    let topKey = 'other';

    for (const [key, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topKey = key;
      }
    }

    return topKey;
  }

  private static generateReasoning(
    category: string,
    priority: string,
    title: string,
    description: string
  ): string {
    const categoryNames: Record<string, string> = {
      development: '开发',
      design: '设计',
      marketing: '营销',
      operations: '运维',
      customerSupport: '客户支持',
      research: '研究',
      other: '其他'
    };

    const priorityNames: Record<string, string> = {
      urgent: '紧急',
      high: '高',
      medium: '中等',
      low: '低'
    };

    return `基于任务标题"${title.substring(0, 50)}..."和描述中的关键词，建议将此任务归类为"${categoryNames[category]}"，优先级设为"${priorityNames[priority]}"。`;
  }

  // 批量分析任务
  static analyzeBatch(
    tasks: Array<{ title: string; description: string; tags?: string[] }>
  ) {
    return tasks.map(task =>
      this.analyzeTask(task.title, task.description, task.tags || [])
    );
  }

  // 获取任务完成度推荐
  static suggestCompletionActions(
    currentStatus: string,
    description: string
  ): string[] {
    const suggestions: string[] = [];
    const lowerDesc = description.toLowerCase();

    if (currentStatus === 'in_progress') {
      suggestions.push('更新任务进度');

      if (lowerDesc.includes('测试') || lowerDesc.includes('test')) {
        suggestions.push('执行测试并报告结果');
      }

      if (lowerDesc.includes('代码') || lowerDesc.includes('code')) {
        suggestions.push('提交代码审查');
        suggestions.push('更新文档');
      }
    }

    if (currentStatus === 'todo') {
      suggestions.push('开始任务执行');
      suggestions.push('设定预计时间');
    }

    return suggestions;
  }
}

export default AIClassifier;
