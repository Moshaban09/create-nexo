/**
 * Global CLI Configuration
 * Stores runtime configuration and preferences.
 */

export class UserConfig {
  private static instance: UserConfig;

  public isLearningMode: boolean = false;
  public isDebugMode: boolean = false;

  private constructor() {}

  public static getInstance(): UserConfig {
    if (!UserConfig.instance) {
      UserConfig.instance = new UserConfig();
    }
    return UserConfig.instance;
  }
}

export const config = UserConfig.getInstance();
