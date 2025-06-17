'use client'

import React from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Common interface for components that take children
interface WithChildren {
  children?: React.ReactNode
}

// Common interface for components that need the isDark prop
interface ThemeProp {
  isDark: boolean
}

// CodeProps now includes ThemeProp for consistency
interface CodeProps extends WithChildren, ThemeProp {
  inline?: boolean
  className?: string
}

// === Headings ===
export const H1: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <h1 className={`mt-6 mb-4 text-4xl font-extrabold leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h1>
)

export const H2: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <h2 className={`mt-5 mb-3 text-3xl font-bold leading-snug ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h2>
)

export const H3: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <h3 className={`mt-4 mb-2 text-2xl font-semibold leading-snug ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h3>
)

// === Paragraph, Blockquote, Lists ===
export const Paragraph: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <p className={`mb-4 text-[17px] leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{children}</p>
)

export const Blockquote: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <blockquote className={`pl-4 border-l-4 italic border-gray-400 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
    {children}
  </blockquote>
)

export const UL: React.FC<WithChildren> = ({ children }) => (
  // UL and OL themselves typically don't have direct text/background color changes based on theme,
  // their list items (LI) handle the text color.
  <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
)

export const OL: React.FC<WithChildren> = ({ children }) => (
  <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
)

export const LI: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <li className={`ml-4 text-[17px] leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{children}</li>
)

// === Inline Code ===
// InlineCodeProps now extends ThemeProp
interface InlineCodeProps extends WithChildren, ThemeProp {}

export const InlineCode: React.FC<InlineCodeProps> = ({ children, isDark }) => (
  <code
    className={`rounded px-1 py-[2px] font-mono text-sm 
      ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
  >
    {children}
  </code>
)

// === Code block renderer with syntax highlighting ===
export const CodeRenderer: React.FC<CodeProps> = ({
  inline = false,
  className = '',
  children,
  isDark // isDark is already correctly received here
}) => {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match?.[1]

  if (!inline && lang === 'json') {
    try {
      const data = JSON.parse(String(children))
      return (
        // The div wrapping JSONPretty now uses isDark for its background color
        <div className={`my-4 rounded-md border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <JSONPretty data={data} theme={undefined} /> {/* JSONPretty uses 'monikai.css' which is generally dark themed */}
        </div>
      )
    } catch (e) {
      // Fallback for invalid JSON or rendering issues
      console.error("Failed to parse or render JSON:", e);
      return (
        <SyntaxHighlighter
          style={isDark ? materialDark : materialLight}
          language="text" // Fallback to plain text highlighting
          PreTag="div"
          className="my-4 rounded-md"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
  }

  if (!inline && lang) {
    return (
      <SyntaxHighlighter
        style={isDark ? materialDark : materialLight} // SyntaxHighlighter themes handle their own internal colors
        language={lang}
        PreTag="div"
        className="my-4 rounded-md"
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    )
  }

  return <InlineCode isDark={isDark}>{children}</InlineCode>
}

// === Table renderers ===
export const Table: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <div className="overflow-x-auto my-4">
    <table className={`min-w-full border text-left text-sm ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
      {children}
    </table>
  </div>
)

export const THead: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <thead className={`font-semibold ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
    {children}
  </thead>
)

export const TBody: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>{children}</tbody>
)

export const TR: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <tr className={`transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>{children}</tr>
)

export const TH: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <th className={`px-4 py-2 border-b ${isDark ? 'border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'}`}>{children}</th>
)

export const TD: React.FC<WithChildren & ThemeProp> = ({ children, isDark }) => (
  <td className={`px-4 py-2 border-b ${isDark ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`}>{children}</td>
)

// === ReactMarkdown component mappings ===
export function createMarkdownComponents(isDark: boolean): Components {
  return {
    h1: (props) => <H1 isDark={isDark}>{props.children}</H1>,
    h2: (props) => <H2 isDark={isDark}>{props.children}</H2>,
    h3: (props) => <H3 isDark={isDark}>{props.children}</H3>,
    p: (props) => <Paragraph isDark={isDark}>{props.children}</Paragraph>,
    blockquote: (props) => <Blockquote isDark={isDark}>{props.children}</Blockquote>,
    ul: (props) => <UL>{props.children}</UL>,
    ol: (props) => <OL>{props.children}</OL>,
    li: (props) => <LI isDark={isDark}>{props.children}</LI>,
    code: (props: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
        const { inline, className, children } = props
        return (
          <CodeRenderer
            inline={inline}
            className={className}
            isDark={isDark}
          >
            {children}
          </CodeRenderer>
        )
      },
    table: (props) => <Table isDark={isDark}>{props.children}</Table>,
    thead: (props) => <THead isDark={isDark}>{props.children}</THead>,
    tbody: (props) => <TBody isDark={isDark}>{props.children}</TBody>,
    tr: (props) => <TR isDark={isDark}>{props.children}</TR>,
    th: (props) => <TH isDark={isDark}>{props.children}</TH>,
    td: (props) => <TD isDark={isDark}>{props.children}</TD>
  }
}

// === Wrapper Component ===
export const ChatMessage: React.FC<{ content: string; isDark: boolean }> = ({
  content,
  isDark
}) => (
  <ReactMarkdown
    components={createMarkdownComponents(isDark)}
    remarkPlugins={[remarkGfm]}
  >
    {content}
  </ReactMarkdown>
)