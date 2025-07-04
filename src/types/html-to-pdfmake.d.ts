// types/html-to-pdfmake.d.ts
declare module 'html-to-pdfmake' {
    import { Content } from 'pdfmake/interfaces';
  
    interface HtmlToPdfMakeOptions {
      window?: any;
      defaultStyles?: { [key: string]: any };
    }
  
    function htmlToPdfmake(
      html: string,
      options?: HtmlToPdfMakeOptions
    ): Content[];
  
    export default htmlToPdfmake;
  }
  