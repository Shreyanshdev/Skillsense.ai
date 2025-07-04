import React, { type ForwardedRef } from 'react';
import { Editor, EditorProps } from 'react-simple-wysiwyg';
import { EditorProvider } from 'react-simple-wysiwyg';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';

export const TextEditor = React.forwardRef(function TextEditor(
  props: EditorProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <EditorProvider>
      <Editor {...props} ref={ref} id='print'> {/** ccheck it if this woprks fine */}
        {props.children || (
          <Toolbar>
            <BtnUndo />
            <BtnRedo />
            <Separator />
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
            <BtnClearFormatting />
            <HtmlButton />
            <Separator />
            <BtnStyles />
          </Toolbar>
        )}
      </Editor>
    </EditorProvider>
  );
});