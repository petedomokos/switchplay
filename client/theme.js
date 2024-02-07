import { createMuiTheme } from '@material-ui/core/styles'
import { pink } from '@material-ui/core/colors'

const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      blue:"#00008B", //from template code..."#3183FF",
      primary: {
      light: '#5c67a3',
      main: '#3f4771',
      dark: '#2e355b',
      contrastText: '#fff',
      },
      secondary: {
        light: '#ff79b0',
        main: '#ff4081',
        dark: '#c60055',
        contrastText: '#000',
      },
      openTitle: '#3f4771',
      protectedTitle: pink['400'],
      type: 'light'
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 575, //600 - tablet
        md: 768, //900
        lg: 990, //1200
        xl: 1440, //1536
      },
    }
  })

  export default theme