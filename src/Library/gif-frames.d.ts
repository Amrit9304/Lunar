declare module 'gif-frames' {
    interface FrameData {
      getImage(): any;
    }
  
    interface Options {
      url: string;
      frames: number;
      outputType: 'canvas';
    }
  
    function gifFrames(options: Options): Promise<FrameData[]>;
  
    export = gifFrames;
  }