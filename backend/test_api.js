const PORT = process.env.PORT || 3000;
const app = require('./src/index');
const http = require('http');

setTimeout(() => {
  http.get(`http://localhost:${PORT}/api/health`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Health:', data);

      const postData = JSON.stringify({email: 'traveler@music.square', password: '123456'});
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      }, (res2) => {
        let d2 = '';
        res2.on('data', chunk => d2 += chunk);
        res2.on('end', () => {
          const parsed = JSON.parse(d2);
          console.log('Login OK, user:', parsed.user?.username);

          http.get({
            hostname: 'localhost',
            port: PORT,
            path: '/api/feed',
            headers: {'Authorization': 'Bearer ' + parsed.token}
          }, (res3) => {
            let d3 = '';
            res3.on('data', chunk => d3 += chunk);
            res3.on('end', () => {
              const feed = JSON.parse(d3);
              console.log('Feed compositions:', feed.compositions.length);
              if (feed.compositions.length > 0) {
                console.log('  -', feed.compositions[0].title);
                console.log('  -', feed.compositions[1]?.title);
              }
              process.exit(0);
            });
          });
        });
      });
      req.write(postData);
      req.end();
    });
  }).on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
}, 2000);
