import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // 基本操作
  { keys: ['Ctrl/Cmd', 'A'], description: '全选', category: 'basic' },
  { keys: ['Ctrl/Cmd', 'C'], description: '复制', category: 'basic' },
  { keys: ['Ctrl/Cmd', 'V'], description: '粘贴', category: 'basic' },
  { keys: ['Ctrl/Cmd', 'X'], description: '剪切', category: 'basic' },
  { keys: ['Ctrl/Cmd', 'Z'], description: '撤销', category: 'basic' },
  { keys: ['Ctrl/Cmd', 'Y'], description: '重做', category: 'basic' },
  
  // 文本格式
  { keys: ['Ctrl/Cmd', 'B'], description: '粗体', category: 'format' },
  { keys: ['Ctrl/Cmd', 'I'], description: '斜体', category: 'format' },
  { keys: ['Ctrl/Cmd', 'U'], description: '下划线', category: 'format' },
  { keys: ['Ctrl/Cmd', 'Shift', 'S'], description: '删除线', category: 'format' },
  { keys: ['Ctrl/Cmd', 'K'], description: '添加链接', category: 'format' },
  
  // 标题
  { keys: ['Ctrl/Cmd', 'Alt', '1'], description: '标题 1', category: 'heading' },
  { keys: ['Ctrl/Cmd', 'Alt', '2'], description: '标题 2', category: 'heading' },
  { keys: ['Ctrl/Cmd', 'Alt', '3'], description: '标题 3', category: 'heading' },
  { keys: ['Ctrl/Cmd', 'Alt', '0'], description: '普通段落', category: 'heading' },
  
  // 列表
  { keys: ['Ctrl/Cmd', 'Shift', '8'], description: '无序列表', category: 'list' },
  { keys: ['Ctrl/Cmd', 'Shift', '7'], description: '有序列表', category: 'list' },
  { keys: ['Tab'], description: '列表缩进', category: 'list' },
  { keys: ['Shift', 'Tab'], description: '列表取消缩进', category: 'list' },
  
  // 对齐
  { keys: ['Ctrl/Cmd', 'Shift', 'L'], description: '左对齐', category: 'align' },
  { keys: ['Ctrl/Cmd', 'Shift', 'E'], description: '居中对齐', category: 'align' },
  { keys: ['Ctrl/Cmd', 'Shift', 'R'], description: '右对齐', category: 'align' },
  
  // 其他
  { keys: ['Ctrl/Cmd', 'Shift', '.'], description: '引用块', category: 'other' },
  { keys: ['Ctrl/Cmd', 'Shift', 'C'], description: '代码块', category: 'other' },
  { keys: ['Enter'], description: '换行', category: 'other' },
  { keys: ['Shift', 'Enter'], description: '软换行', category: 'other' },
];

const categoryNames = {
  basic: '基本操作',
  format: '文本格式',
  heading: '标题',
  list: '列表',
  align: '对齐',
  other: '其他',
};

const categoryColors = {
  basic: 'bg-blue-50 text-blue-700 border-blue-200',
  format: 'bg-green-50 text-green-700 border-green-200',
  heading: 'bg-purple-50 text-purple-700 border-purple-200',
  list: 'bg-orange-50 text-orange-700 border-orange-200',
  align: 'bg-pink-50 text-pink-700 border-pink-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function KeyboardShortcutsHelp() {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          编辑器快捷键
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className={`text-sm font-semibold px-3 py-1 rounded-full border ${categoryColors[category as keyof typeof categoryColors]}`}>
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="text-sm text-gray-700">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-xs text-gray-400 mx-1">+</span>
                          )}
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white">
                            {key}
                          </Badge>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong> 在 Mac 上使用 Cmd 键，在 Windows/Linux 上使用 Ctrl 键。
            大部分快捷键与常见的文本编辑器保持一致。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
