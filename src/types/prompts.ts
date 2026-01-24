export interface PromptOption {
  value: string;
  name: string;
  comment?: string;
  hover_note?: string;
  folder_info?: string[];
}

export interface PromptConfig {
  name: string;
  message: string;
  type: 'list' | 'checkbox' | 'input';
  options: PromptOption[];
}
