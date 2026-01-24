
export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: string | boolean;
}

export interface CommandArgs {
    name: string;
    description: string;
    required?: boolean;
}

export interface Command {
  name: string;
  description: string;
  alias?: string;
  isDefault?: boolean;
  args?: CommandArgs[];
  options?: CommandOption[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (...args: any[]) => Promise<void>;
}
