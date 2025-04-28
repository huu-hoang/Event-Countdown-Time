declare module 'react-native-sound' {
  class Sound {
    constructor(
      filename: string,
      basePath?: string,
      errorCallback?: (error: any) => void
    );
    play(callback?: (success: boolean) => void): void;
    stop(callback?: () => void): void;
    release(): void;
    static setCategory(category: string, mixWithOthers?: boolean): void;
  }
  export default Sound;
} 