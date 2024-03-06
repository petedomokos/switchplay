export default () => {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Security-Policy" content="font-src 'self' 'unsafe-inline' https://fonts.gstatic.com data:; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data:; script-src 'unsafe-eval' 'unsafe-inline' http://localhost:3000/dist/bundle.js 'https://switchplay-app.herokuapp.com/dist/bundle.js' data:; default-src 'self' localhost:*">
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" charset="utf-8">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="theme-color" content="#DBEFF0" />
        <title>Switchplay</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400">
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=B612:400,400i,700,700i|DM+Sans:400,400i,500,500i,700,700i&display=swap"
          />
        <style>
            a{
              text-decoration: none;
              color: #061d95
            }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript" src="/dist/bundle.js"></script>
      </body>
    </html>`
}