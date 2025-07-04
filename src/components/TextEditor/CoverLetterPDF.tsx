// src/components/pdf/CoverLetterPDF.tsx
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Optional: custom font
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
});

const CoverLetterPDF = ({ content }: { content: string }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Cover Letter</Text>
        {/* Split by lines to preserve paragraphs */}
        {content
          .split('\n')
          .filter(Boolean)
          .map((line, index) => (
            <Text key={index} style={styles.paragraph}>
              {line}
            </Text>
          ))}
      </Page>
    </Document>
  );
};

export default CoverLetterPDF;
