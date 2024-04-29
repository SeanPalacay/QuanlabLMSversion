/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
            'custom': '768px', // Your custom breakpoint    
            'phone': '368px',   
            'custom1020': '1020px', 
            'custom1130': '1130px', 
            'chatroom' : '414px',
            'smallest' : '375px'
          },
      colors: {
        primary: '#0375AF',
        secondary: '#6CF5BC'
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      },
      fontSize: {
        '25px': '25px'
      }
    },
  },
  plugins: []
  
}
