import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* RevX.pro brand colors */
    --primary-color: #0F1B3D;     /* Deep navy blue - primary brand color */
    --secondary-color: #255FE9;   /* Bright blue - secondary brand color */
    --accent-color: #FF4A2D;      /* Vibrant orange-red - accent color */
    --background-color: #FAFBFC;  /* Light off-white background */
    --text-color: #0F1B3D;        /* Dark blue for main text */
    --light-text-color: #7E8394;  /* Muted blue-gray for secondary text */
    --border-color: #E1E4EA;      /* Light gray for borders */
    --success-color: #22C55E;     /* Green for success messages */
    --warning-color: #F59E0B;     /* Amber for warnings */
    --error-color: #FF4A2D;       /* Same as accent for errors */
    --box-shadow: 0 4px 10px rgba(15, 27, 61, 0.1); /* Subtle shadow with brand color */
    --border-radius: 12px;        /* Slightly more rounded corners */
    --transition-speed: 0.3s;     /* Keep the same transition speed */
    --font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: var(--font-family);
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
  }

  button {
    cursor: pointer;
    font-family: var(--font-family);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-speed);
    
    &:hover {
      color: var(--secondary-color);
    }
  }
`;

export default GlobalStyles;
