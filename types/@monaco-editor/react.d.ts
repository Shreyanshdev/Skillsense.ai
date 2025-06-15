// types/@monaco-editor/react.d.ts
declare module '@monaco-editor/react' {
    import * as React from 'react';
    import { editor } from 'monaco-editor';
  
    export interface MonacoEditorProps {
      height?: string | number;
      width?: string | number;
      value?: string;
      defaultValue?: string;
      language?: string;
      theme?: 'light' | 'dark' | 'vs-dark' | string;
      options?: editor.IStandaloneEditorConstructionOptions;
      onChange?: (value: string | undefined, event: editor.IModelContentChangedEvent) => void;
      onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
      loading?: React.ReactNode;
      className?: string;
      wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
    }
  
    const Editor: React.ComponentType<MonacoEditorProps>;
    export function DiffEditor(props: MonacoEditorProps): JSX.Element;
    export function ControlledEditor(props: MonacoEditorProps): JSX.Element;
    
    export default Editor;
  }