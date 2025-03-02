/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.prose': {
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginTop: '1.5em',
            marginBottom: '0.5em',
            fontWeight: '700',
            lineHeight: '1.2',
          },
          '& h1': {
            fontSize: '2.25em',
          },
          '& h2': {
            fontSize: '1.875em',
          },
          '& h3': {
            fontSize: '1.5em',
          },
          '& p': {
            marginTop: '1em',
            marginBottom: '1em',
          },
          '& a': {
            color: '#4f46e5',
            textDecoration: 'underline',
            '&:hover': {
              color: '#4338ca',
            },
          },
          '& ul, & ol': {
            paddingLeft: '1.5em',
            marginTop: '1em',
            marginBottom: '1em',
          },
          '& li': {
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          '& blockquote': {
            fontStyle: 'italic',
            borderLeftWidth: '4px',
            borderLeftColor: '#e5e7eb',
            paddingLeft: '1em',
            marginLeft: '0',
            marginRight: '0',
          },
          '& img': {
            marginTop: '2em',
            marginBottom: '2em',
            borderRadius: '0.375rem',
          },
          '& code': {
            color: '#ef4444',
            fontWeight: '600',
            backgroundColor: '#f3f4f6',
            padding: '0.2em 0.4em',
            borderRadius: '0.25rem',
          },
          '& pre': {
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '1em',
            borderRadius: '0.375rem',
            overflow: 'auto',
            marginTop: '1.5em',
            marginBottom: '1.5em',
            '& code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              padding: '0',
            },
          },
          '& hr': {
            marginTop: '2em',
            marginBottom: '2em',
          },
          '& table': {
            width: '100%',
            tableLayout: 'auto',
            textAlign: 'left',
            marginTop: '2em',
            marginBottom: '2em',
            borderCollapse: 'collapse',
          },
          '& thead': {
            borderBottomWidth: '2px',
            borderBottomColor: '#e5e7eb',
          },
          '& th': {
            padding: '0.75em',
            fontWeight: '600',
          },
          '& td': {
            padding: '0.75em',
            borderTopWidth: '1px',
            borderTopColor: '#e5e7eb',
          },
        },
        '.prose-invert': {
          color: '#e2e8f0',
          '& a': {
            color: '#818cf8',
            '&:hover': {
              color: '#a5b4fc',
            },
          },
          '& blockquote': {
            borderLeftColor: '#4b5563',
          },
          '& code': {
            color: '#f87171',
            backgroundColor: '#1e293b',
          },
          '& thead': {
            borderBottomColor: '#4b5563',
          },
          '& td': {
            borderTopColor: '#4b5563',
          },
        },
      });
    },
  ],
};