declare module 'dom-to-image-more' {
    interface DomToImageOptions {
      width?: number;
      height?: number;
      quality?: number;
      bgcolor?: string;
      style?: Partial<CSSStyleDeclaration>;
      filter?: (node: HTMLElement) => boolean;
      imagePlaceholder?: string;
      cacheBust?: boolean;
    }
  
    const domtoimage: {
      toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
      toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
      toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
      toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>;
    };
  
    export default domtoimage;
  }
  